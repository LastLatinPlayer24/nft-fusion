import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useWeb3, getAvailableWallets, WalletType } from '@/contexts/Web3Context';
import { Wallet, Power, ExternalLink, ChevronDown } from 'lucide-react';

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletConnect() {
  const { account, walletType, isConnected, isConnecting, error, connect, disconnect } = useWeb3();
  const [open, setOpen] = React.useState(false);
  const wallets = getAvailableWallets();

  const handleConnect = async (type: WalletType) => {
    await connect(type);
    setOpen(false);
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs hidden sm:flex items-center gap-1 h-8 px-3">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          {formatAddress(account)}
          {walletType && <span className="text-muted-foreground ml-1 capitalize">· {walletType}</span>}
        </Badge>
        <Button variant="ghost" size="sm" onClick={disconnect} className="h-8 px-2">
          <Power className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Connect</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-2 mt-2">
          {wallets.map((wallet) => (
            <div key={wallet.type} className="flex items-center gap-2">
              {wallet.available ? (
                <Button
                  variant="outline"
                  className="flex-1 justify-start gap-3 h-12"
                  onClick={() => handleConnect(wallet.type)}
                  disabled={isConnecting}
                >
                  <span className="text-xl">{wallet.emoji}</span>
                  <span className="font-medium">{wallet.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Detected</Badge>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="flex-1 justify-start gap-3 h-12 opacity-60"
                  asChild
                >
                  <a href={wallet.installUrl} target="_blank" rel="noopener noreferrer">
                    <span className="text-xl">{wallet.emoji}</span>
                    <span className="font-medium">{wallet.name}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      Install <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Only EVM-compatible wallets (Ethereum, Polygon, BNB...)
        </p>
      </DialogContent>
    </Dialog>
  );
}
