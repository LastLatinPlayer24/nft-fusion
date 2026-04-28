import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp } from 'lucide-react';

interface PricePoint { date: string; BTC: number | null; ETH: number | null; SOL: number | null }

function fmt(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

async function fetchPrices(): Promise<PricePoint[]> {
  const ids = ['bitcoin', 'ethereum', 'solana'];
  const results = await Promise.all(
    ids.map(id =>
      fetch(`/api/coingecko?path=coins/${id}/market_chart&vs_currency=usd&days=7&interval=daily`)
        .then(r => r.json())
        .catch(() => null)
    )
  );

  const [btc, eth, sol] = results;
  const len = btc?.prices?.length ?? 0;
  return Array.from({ length: len }, (_, i) => {
    const ts = btc?.prices?.[i]?.[0];
    return {
      date: ts ? new Date(ts).toLocaleDateString('es', { month: 'short', day: 'numeric' }) : '',
      BTC: btc?.prices?.[i]?.[1] ?? null,
      ETH: eth?.prices?.[i]?.[1] ?? null,
      SOL: sol?.prices?.[i]?.[1] ?? null,
    };
  });
}

export function CryptoChart() {
  const [data, setData] = React.useState<PricePoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchPrices().then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Precios Crypto — 7 días
        </CardTitle>
        <CardDescription>BTC · ETH · SOL via CoinGecko</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="btc" orientation="right" tickFormatter={fmt} tick={{ fontSize: 9 }} width={52} domain={['auto', 'auto']} />
                <YAxis yAxisId="alt" orientation="left" tickFormatter={fmt} tick={{ fontSize: 9 }} width={48} domain={['auto', 'auto']} />
                <Tooltip formatter={(v: number, name: string) => [`$${v.toLocaleString()}`, name]} />
                <Legend />
                <Line yAxisId="btc" type="monotone" dataKey="BTC" stroke="#F7931A" strokeWidth={2} dot={false} />
                <Line yAxisId="alt" type="monotone" dataKey="ETH" stroke="#627EEA" strokeWidth={2} dot={false} />
                <Line yAxisId="alt" type="monotone" dataKey="SOL" stroke="#9945FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
