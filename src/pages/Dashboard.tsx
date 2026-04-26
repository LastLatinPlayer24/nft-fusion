import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketOverview } from '@/components/MarketOverview';
import { RecentAnalysis } from '@/components/RecentAnalysis';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Dashboard() {
  const { t } = useLanguage();

  const marketStats = [
    {
      title: t('dashboard.marketCap'),
      value: "$2.1T",
      change: "+2.4%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: t('dashboard.volume'),
      value: "$156B",
      change: "-1.2%",
      isPositive: false,
      icon: Activity,
    },
    {
      title: t('dashboard.activePositions'),
      value: "24",
      change: "+3",
      isPositive: true,
      icon: TrendingUp,
    },
    {
      title: t('dashboard.aiConfidence'),
      value: "85%",
      change: "+5%",
      isPositive: true,
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Market Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {marketStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium truncate">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
                <div className={`text-xs flex items-center ${
                  stat.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <MarketOverview />
      </div>

      <RecentAnalysis />
    </div>
  );
}
