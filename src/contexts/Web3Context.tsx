import * as React from 'react';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

type Web3ProviderState = {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const initialState: Web3ProviderState = {
  account: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
};

const Web3ProviderContext = React.createContext<Web3ProviderState>(initialState);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Auto-reconnect if previously connected
  React.useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        const list = accounts as string[];
        if (list.length > 0) setAccount(list[0] ?? null);
      }).catch(() => {});

      const handleAccountsChanged = (accounts: unknown) => {
        const list = accounts as string[];
        setAccount(list.length > 0 ? (list[0] ?? null) : null);
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError('MetaMask not found. Install MetaMask to connect your wallet.');
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      setAccount(accounts[0] ?? null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes('rejected') ? 'Connection rejected by user.' : msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setError(null);
  };

  return (
    <Web3ProviderContext.Provider value={{
      account,
      isConnected: account !== null,
      isConnecting,
      error,
      connect,
      disconnect,
    }}>
      {children}
    </Web3ProviderContext.Provider>
  );
}

export const useWeb3 = () => {
  const context = React.useContext(Web3ProviderContext);
  if (context === undefined) throw new Error('useWeb3 must be used within a Web3Provider');
  return context;
};
