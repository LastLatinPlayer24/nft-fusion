import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';
import { getHottestCollections, type NFTCollection } from '@/services/api';

export function PredictionChart() {
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getHottestCollections(8)
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  const data = collections.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 11) + '…' : c.name,
    floor: parseFloat(c.floor_price ?? '0'),
    floorUSD: parseFloat(c.floor_price_usd ?? '0'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Floor Price by Collection
        </CardTitle>
        <CardDescription>Current ETH floor prices across top 8 NFT collections</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tickFormatter={v => `${v}`} tick={{ fontSize: 10 }} width={48} unit=" ETH" />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    name === 'floor'
                      ? [`${v.toFixed(3)} ETH`, 'Floor Price']
                      : [`$${v.toLocaleString()}`, 'USD Value']
                  }
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="floor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
