import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Zap, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAIInsights, type AIInsight } from '@/services/api';

const typeConfig = {
  opportunity: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800' },
  signal: { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-800' },
};

export function AIInsights() {
  const { t } = useLanguage();
  const [insights, setInsights] = React.useState<AIInsight[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    setLoading(true);
    getAIInsights()
      .then(setInsights)
      .catch(() => setInsights([]))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Generating AI insights...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No insights available.</p>
      )}
      {insights.map((insight, index) => {
        const cfg = typeConfig[insight.type] ?? typeConfig.signal;
        const Icon = cfg.icon;
        return (
          <div key={index} className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full ${cfg.bg}`}>
                <Icon className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm md:text-base truncate">{insight.title}</h4>
                  <div className="flex items-center space-x-2 ml-2">
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {insight.confidence}% {t('common.confidence')}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {insight.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence Level</span>
                    <span className="font-medium">{insight.confidence}%</span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <Button variant="outline" className="w-full mt-4" onClick={load} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        Refresh Insights
      </Button>
    </div>
  );
}
