import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketTable } from '@/components/MarketTable';
import { MarketFilters } from '@/components/MarketFilters';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function MarketData() {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('market.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('market.subtitle')}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full md:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {t('market.refresh')}
        </Button>
      </div>

      <MarketFilters />

      <Card>
        <CardHeader>
          <CardTitle>{t('market.overview')}</CardTitle>
          <CardDescription>
            {t('market.realTimePrices')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <MarketTable />
        </CardContent>
      </Card>
    </div>
  );
}
