import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function MarketOverview() {
  const marketEvents = [
    {
      title: "Fed Interest Rate Decision",
      time: "2 hours ago",
      impact: "high",
      description: "Federal Reserve maintains current rates at 5.25%"
    },
    {
      title: "Tech Earnings Season",
      time: "1 day ago",
      impact: "medium",
      description: "Major tech companies reporting quarterly earnings"
    },
    {
      title: "Oil Price Surge",
      time: "3 hours ago",
      impact: "high",
      description: "Crude oil prices up 4% on supply concerns"
    },
    {
      title: "Currency Volatility",
      time: "5 hours ago",
      impact: "low",
      description: "USD strengthens against major currencies"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Events</CardTitle>
        <CardDescription>
          Recent market-moving events and news
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketEvents.map((event, index) => (
            <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">{event.title}</h4>
                  <Badge variant={getImpactColor(event.impact)} className="text-xs">
                    {event.impact}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
