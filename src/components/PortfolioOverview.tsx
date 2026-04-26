import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, DollarSign, ImageIcon, Wallet } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getWalletNFTs, getWalletTokens, getMarketStats } from '@/services/api';

export function PortfolioOverview() {
  const { account, isConnected } = useWeb3();
  const [nftCount, setNftCount] = React.useState<number | null>(null);
  const [tokenValue, setTokenValue] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sentiment, setSentiment] = React.useState<'BULLISH' | 'NEUTRAL' | null>(null);
  const [sentimentSub, setSentimentSub] = React.useState('Loading market data...');

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

  React.useEffect(() => {
    getMarketStats()
      .then(stats => {
        setSentiment(stats.sentiment);
        const btc = stats.btc_dominance !== null ? `BTC dom. ${stats.btc_dominance.toFixed(1)}%` : 'NFT market 24h trend';
        const eth = stats.eth_dominance !== null ? ` · ETH ${stats.eth_dominance.toFixed(1)}%` : '';
        setSentimentSub(btc + eth);
      })
      .catch(() => {
        setSentiment(null);
        setSentimentSub('Market data unavailable');
      });
  }, []);

  const SignalIcon = sentiment === 'BULLISH' ? TrendingUp : sentiment === 'NEUTRAL' ? Minus : TrendingDown;
  const signalColor = sentiment === 'BULLISH' ? 'text-green-500' : sentiment === 'NEUTRAL' ? 'text-yellow-500' : 'text-muted-foreground';

  const stats = [
    {
      title: 'Token Value',
      value: tokenValue !== null
        ? `$${tokenValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
        : isConnected ? (loading ? '...' : 'N/A') : 'Connect wallet',
      sub: 'ERC-20 portfolio',
      icon: DollarSign,
      iconColor: '',
    },
    {
      title: 'NFTs Owned',
      value: nftCount !== null ? String(nftCount) : (isConnected ? (loading ? '...' : 'N/A') : '—'),
      sub: 'across all collections',
      icon: ImageIcon,
      iconColor: '',
    },
    {
      title: 'Wallet',
      value: account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected',
      sub: isConnected ? 'Ethereum Mainnet' : 'Connect to view portfolio',
      icon: Wallet,
      iconColor: '',
    },
    {
      title: 'Market Signal',
      value: sentiment ?? '—',
      sub: sentimentSub,
      icon: SignalIcon,
      iconColor: signalColor,
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
              <Icon className={`h-4 w-4 ${stat.iconColor || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl md:text-2xl font-bold truncate ${stat.title === 'Market Signal' ? signalColor : ''}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
