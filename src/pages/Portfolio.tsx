import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioOverview } from '@/components/PortfolioOverview';
import { PositionsList } from '@/components/PositionsList';
import { PortfolioChart } from '@/components/PortfolioChart';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Portfolio() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('portfolio.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('portfolio.subtitle')}
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('portfolio.addPosition')}
        </Button>
      </div>

      <PortfolioOverview />

      {/* Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="order-2 lg:order-1">
          <PortfolioChart />
        </div>
        <div className="order-1 lg:order-2">
          <PositionsList />
        </div>
      </div>
    </div>
  );
}
