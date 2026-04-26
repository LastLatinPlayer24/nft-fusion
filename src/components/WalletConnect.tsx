import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useWeb3, getAvailableWallets, WalletType } from '@/contexts/Web3Context';
import { Wallet, Power, ExternalLink, ChevronDown, ShieldCheck, ShieldX, ArrowLeft } from 'lucide-react';

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const CAN_DO = [
  'View your NFT holdings (read only)',
  'View your token balances (read only)',
  'Analyze your portfolio with AI',
];

const CANNOT_DO = [
  'Send transactions or move funds',
  'Access your private key or seed phrase',
  'Sign messages without your approval',
  'Transfer, sell, or list your NFTs',
];

export function WalletConnect() {
  const { account, walletType, isConnected, isConnecting, error, connect, disconnect } = useWeb3();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<'select' | 'confirm'>('select');
  const [selectedWallet, setSelectedWallet] = React.useState<WalletType | null>(null);
  const wallets = getAvailableWallets();

  const handleSelectWallet = (type: WalletType) => {
    setSelectedWallet(type);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedWallet) return;
    await connect(selectedWallet);
    setOpen(false);
    setStep('select');
    setSelectedWallet(null);
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) { setStep('select'); setSelectedWallet(null); }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs hidden sm:flex items-center gap-1.5 h-8 px-3">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
          {formatAddress(account)}
          {walletType && <span className="text-muted-foreground ml-1 capitalize">· {walletType}</span>}
        </Badge>
        <Button variant="ghost" size="sm" onClick={disconnect} className="h-8 px-2" title="Disconnect wallet">
          <Power className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
            {step === 'confirm' && (
              <button onClick={() => setStep('select')} className="mr-1 hover:opacity-70">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Wallet className="h-5 w-5" />
            {step === 'select' ? 'Connect Wallet' : 'Security Review'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: wallet selector */}
        {step === 'select' && (
          <>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2 mt-1">
              {wallets.map((wallet) =>
                wallet.available ? (
                  <Button
                    key={wallet.type}
                    variant="outline"
                    className="justify-start gap-3 h-12"
                    onClick={() => handleSelectWallet(wallet.type)}
                  >
                    <span className="text-xl">{wallet.emoji}</span>
                    <span className="font-medium">{wallet.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">Detected</Badge>
                  </Button>
                ) : (
                  <Button
                    key={wallet.type}
                    variant="ghost"
                    className="justify-start gap-3 h-12 opacity-50"
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
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              EVM wallets only (Ethereum, Polygon, BNB...)
            </p>
          </>
        )}

        {/* Step 2: security confirmation */}
        {step === 'confirm' && selectedWallet && (
          <div className="space-y-4 mt-1">
            <div className="rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-3 space-y-1.5">
              <p className="text-xs font-semibold flex items-center gap-1.5 text-green-700 dark:text-green-400 mb-2">
                <ShieldCheck className="h-4 w-4" /> This app CAN:
              </p>
              {CAN_DO.map(item => (
                <p key={item} className="text-xs text-green-700 dark:text-green-400 flex gap-1.5">
                  <span>✅</span> {item}
                </p>
              ))}
            </div>

            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 space-y-1.5">
              <p className="text-xs font-semibold flex items-center gap-1.5 text-red-700 dark:text-red-400 mb-2">
                <ShieldX className="h-4 w-4" /> This app CANNOT:
              </p>
              {CANNOT_DO.map(item => (
                <p key={item} className="text-xs text-red-700 dark:text-red-400 flex gap-1.5">
                  <span>🚫</span> {item}
                </p>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Your private key <strong>never leaves your wallet</strong>. This app is read-only.
            </p>

            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : `Connect with ${wallets.find(w => w.type === selectedWallet)?.name}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
