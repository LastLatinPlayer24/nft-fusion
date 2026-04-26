import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ImageIcon, Wallet } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getWalletNFTs, getWalletTokens } from '@/services/api';

export function PortfolioOverview() {
  const { account, isConnected } = useWeb3();
  const [nftCount, setNftCount] = React.useState<number | null>(null);
  const [tokenValue, setTokenValue] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!account) { setNftCount(null); setTokenValue(null); return; }
    setLoading(true);
    Promise.all([
      getWalletNFTs(account, 100).catch(() => null),
      getWalletTokens(account).catch(() => null),
    ]).then(([nfts, tokens]) => {
      setNftCount(nfts?.totalCount ?? null);
      const total = (tokens ?? []).reduce((s, t) => s + parseFloat(t.usd_value ?? '0'), 0);
      setTokenValue(total);
    }).finally(() => setLoading(false));
  }, [account]);

  const stats = [
    {
      title: 'Token Value',
      value: tokenValue !== null ? `$${tokenValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : (isConnected ? (loading ? '...' : 'N/A') : 'Connect wallet'),
      sub: 'ERC-20 portfolio',
      icon: DollarSign,
    },
    {
      title: 'NFTs Owned',
      value: nftCount !== null ? String(nftCount) : (isConnected ? (loading ? '...' : 'N/A') : '—'),
      sub: 'across all collections',
      icon: ImageIcon,
    },
    {
      title: 'Wallet',
      value: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected',
      sub: isConnected ? 'Ethereum Mainnet' : 'Connect to view portfolio',
      icon: Wallet,
    },
    {
      title: 'Market Signal',
      value: 'BULLISH',
      sub: 'NFT market 24h trend',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold truncate">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
