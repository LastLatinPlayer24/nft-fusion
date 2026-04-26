import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

export function RecentAnalysis() {
  const analyses = [
    {
      symbol: 'AAPL',
      prediction: 'Bullish',
      confidence: 87,
      target: '$185.50',
      timeframe: '7 days',
      isPositive: true
    },
    {
      symbol: 'TSLA',
      prediction: 'Bearish',
      confidence: 73,
      target: '$220.00',
      timeframe: '14 days',
      isPositive: false
    },
    {
      symbol: 'MSFT',
      prediction: 'Bullish',
      confidence: 92,
      target: '$395.75',
      timeframe: '30 days',
      isPositive: true
    },
    {
      symbol: 'GOOGL',
      prediction: 'Neutral',
      confidence: 65,
      target: '$142.25',
      timeframe: '7 days',
      isPositive: null
    }
  ];

  const getPredictionColor = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case 'bullish': return 'default';
      case 'bearish': return 'destructive';
      case 'neutral': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          Recent AI Analysis
        </CardTitle>
        <CardDescription>
          Latest predictions and market insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyses.map((analysis, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="font-mono font-bold text-lg">{analysis.symbol}</div>
                <div className="flex items-center space-x-2">
                  {analysis.isPositive === true && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {analysis.isPositive === false && <TrendingDown className="h-4 w-4 text-red-600" />}
                  <Badge variant={getPredictionColor(analysis.prediction)}>
                    {analysis.prediction}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{analysis.target}</div>
                <div className="text-sm text-muted-foreground">
                  {analysis.confidence}% confidence • {analysis.timeframe}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
