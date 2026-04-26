import * as React from 'react';

interface EthProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthProvider;
    okxwallet?: EthProvider;
    phantom?: { ethereum?: EthProvider; solana?: unknown };
    exodus?: { ethereum?: EthProvider };
  }
}

export type WalletType = 'metamask' | 'okx' | 'phantom' | 'exodus';

export interface WalletOption {
  type: WalletType;
  name: string;
  emoji: string;
  available: boolean;
  installUrl: string;
}

function getProvider(wallet: WalletType): EthProvider | null {
  switch (wallet) {
    case 'metamask': return window.ethereum?.isMetaMask ? window.ethereum! : (window.ethereum ?? null);
    case 'okx':      return window.okxwallet ?? null;
    case 'phantom':  return window.phantom?.ethereum ?? null;
    case 'exodus':   return window.exodus?.ethereum ?? null;
  }
}

export function getAvailableWallets(): WalletOption[] {
  return [
    { type: 'metamask', name: 'MetaMask',    emoji: '🦊', available: !!window.ethereum,             installUrl: 'https://metamask.io/download/' },
    { type: 'okx',      name: 'OKX Wallet',  emoji: '⭕', available: !!window.okxwallet,            installUrl: 'https://www.okx.com/web3' },
    { type: 'phantom',  name: 'Phantom',      emoji: '👻', available: !!window.phantom?.ethereum,    installUrl: 'https://phantom.app/' },
    { type: 'exodus',   name: 'Exodus',       emoji: '🌌', available: !!window.exodus?.ethereum,     installUrl: 'https://www.exodus.com/' },
  ];
}

type Web3ProviderState = {
  account: string | null;
  walletType: WalletType | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (wallet: WalletType) => Promise<void>;
  disconnect: () => void;
};

const initialState: Web3ProviderState = {
  account: null,
  walletType: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
};

const Web3ProviderContext = React.createContext<Web3ProviderState>(initialState);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = React.useState<string | null>(null);
  const [walletType, setWalletType] = React.useState<WalletType | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('connectedWallet') as WalletType | null;
    if (!saved) return;
    const provider = getProvider(saved);
    if (!provider) return;
    provider.request({ method: 'eth_accounts' }).then((accounts) => {
      const list = accounts as string[];
      if (list.length > 0) { setAccount(list[0] ?? null); setWalletType(saved); }
    }).catch(() => {});

    const handleAccountsChanged = (accounts: unknown) => {
      const list = accounts as string[];
      setAccount(list.length > 0 ? (list[0] ?? null) : null);
      if (list.length === 0) { setWalletType(null); localStorage.removeItem('connectedWallet'); }
    };
    provider.on('accountsChanged', handleAccountsChanged);
    return () => provider.removeListener('accountsChanged', handleAccountsChanged);
  }, []);

  const connect = async (wallet: WalletType) => {
    const provider = getProvider(wallet);
    if (!provider) {
      const opt = getAvailableWallets().find(w => w.type === wallet);
      setError(`${opt?.name ?? wallet} not found. Install it first.`);
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      setAccount(accounts[0] ?? null);
      setWalletType(wallet);
      localStorage.setItem('connectedWallet', wallet);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg.includes('rejected') ? 'Connection rejected by user.' : msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setWalletType(null);
    setError(null);
    localStorage.removeItem('connectedWallet');
  };

  return (
    <Web3ProviderContext.Provider value={{
      account, walletType, isConnected: account !== null, isConnecting, error, connect, disconnect,
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
