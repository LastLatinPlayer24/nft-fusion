import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { getAIInsights, type AIInsight } from '@/services/api';

export function RecentAnalysis() {
  const [insights, setInsights] = React.useState<AIInsight[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getAIInsights('top NFT collections market overview')
      .then(setInsights)
      .catch(() => setInsights([]))
      .finally(() => setLoading(false));
  }, []);

  const getBadgeVariant = (type: AIInsight['type']) => {
    switch (type) {
      case 'opportunity': return 'default' as const;
      case 'warning':     return 'destructive' as const;
      case 'signal':      return 'secondary' as const;
    }
  };

  const getIcon = (type: AIInsight['type']) =>
    type === 'warning'
      ? <TrendingDown className="h-4 w-4 text-red-600" />
      : <TrendingUp className="h-4 w-4 text-green-600" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Market Insights
        </CardTitle>
        <CardDescription>Live NFT market signals powered by AI</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Analyzing market...
          </div>
        ) : insights.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-6">No insights available</p>
        ) : (
          <div className="space-y-4">
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-4 border rounded-lg">
                <div className="flex items-start gap-3 min-w-0">
                  {getIcon(ins.type)}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{ins.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{ins.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant={getBadgeVariant(ins.type)} className="capitalize text-xs">
                    {ins.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(ins.confidence * 100)}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
