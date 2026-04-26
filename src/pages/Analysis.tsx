import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AIInsights } from '@/components/AIInsights';
import { PredictionChart } from '@/components/PredictionChart';
import { AnalysisFilters } from '@/components/AnalysisFilters';
import { Button } from '@/components/ui/button';
import { Brain, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Analysis() {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generateAnalysis = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('analysis.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('analysis.subtitle')}
          </p>
        </div>
        <Button onClick={generateAnalysis} disabled={isGenerating} className="w-full md:w-auto">
          <Brain className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
          {t('analysis.generate')}
        </Button>
      </div>

      <AnalysisFilters />

      {/* Stack on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              {t('analysis.insights')}
            </CardTitle>
            <CardDescription>
              {t('analysis.mlInsights')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <AIInsights />
          </CardContent>
        </Card>

        <PredictionChart />
      </div>
    </div>
  );
}
