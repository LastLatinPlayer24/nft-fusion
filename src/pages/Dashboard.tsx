import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketOverview } from '@/components/MarketOverview';
import { RecentAnalysis } from '@/components/RecentAnalysis';
import { PerformanceChart } from '@/components/PerformanceChart';
import { CryptoChart } from '@/components/CryptoChart';
import { MarketCapPie } from '@/components/MarketCapPie';
import { TrendingUp, TrendingDown, Activity, DollarSign, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getHottestCollections, type NFTCollection } from '@/services/api';

function fmtVol(usd: number) {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
  return `$${usd.toFixed(0)}`;
}

export function Dashboard() {
  const { t } = useLanguage();
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getHottestCollections(20)
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const totalVolume = collections.reduce((s, c) => s + parseFloat(c.volume_usd ?? '0'), 0);
  const avgFloorUSD = collections.length
    ? collections.reduce((s, c) => s + parseFloat(c.floor_price_usd ?? '0'), 0) / collections.length
    : 0;
  const activeCollections = collections.filter(c => (c.transactions_count ?? 0) > 0).length;
  const totalBuyers = collections.reduce((s, c) => s + (c.buyers_count ?? 0), 0);

  const marketStats = [
    {
      title: '24h NFT Volume',
      value: loading ? '…' : fmtVol(totalVolume),
      change: `${collections.length} collections`,
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Avg Floor Price',
      value: loading ? '…' : fmtVol(avgFloorUSD),
      change: 'top 20 collections',
      isPositive: true,
      icon: Activity,
    },
    {
      title: 'Active Collections',
      value: loading ? '…' : String(activeCollections),
      change: 'with 24h trades',
      isPositive: activeCollections > 0,
      icon: TrendingUp,
    },
    {
      title: 'Total Buyers (24h)',
      value: loading ? '…' : totalBuyers.toLocaleString(),
      change: 'unique wallets',
      isPositive: true,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {marketStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium truncate">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
                    <div className={`text-xs flex items-center gap-1 mt-1 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <MarketOverview />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CryptoChart />
        <MarketCapPie />
      </div>

      <RecentAnalysis />
    </div>
  );
}
