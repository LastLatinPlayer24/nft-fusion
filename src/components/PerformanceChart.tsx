import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, BarChart2 } from 'lucide-react';
import { getHottestCollections, type NFTCollection } from '@/services/api';

function fmtVol(usd: number) {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
  return `$${usd.toFixed(0)}`;
}

export function PerformanceChart() {
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
    volume: parseFloat(c.volume_usd ?? '0'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          24h Volume by Collection
        </CardTitle>
        <CardDescription>Top 8 NFT collections by USD volume today</CardDescription>
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
                <YAxis tickFormatter={fmtVol} tick={{ fontSize: 10 }} width={52} />
                <Tooltip
                  formatter={(v: number) => [fmtVol(v), '24h Volume']}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
