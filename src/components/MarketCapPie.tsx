import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, PieChart as PieIcon } from 'lucide-react';

interface Coin { name: string; market_cap: number; symbol: string }

const COLORS = ['#F7931A', '#627EEA', '#9945FF', '#00FFA3', '#E84142', '#2775CA', '#F0B90B', '#888888'];

function fmtCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

export function MarketCapPie() {
  const [coins, setCoins] = React.useState<Coin[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/coingecko?path=coins/markets&vs_currency=usd&order=market_cap_desc&per_page=8&page=1')
      .then(r => r.json())
      .then((data: Array<{ name: string; market_cap: number; symbol: string }>) => {
        const top7 = data.slice(0, 7);
        const othersTotal = data.slice(7).reduce((s, c) => s + (c.market_cap ?? 0), 0);
        setCoins([...top7, { name: 'Otros', symbol: 'otros', market_cap: othersTotal }]);
      })
      .catch(() => setCoins([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieIcon className="h-5 w-5" />
          Distribución de Market Cap
        </CardTitle>
        <CardDescription>Top 8 criptomonedas por capitalización</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coins}
                  dataKey="market_cap"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {coins.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, name: string) => [fmtCap(v), name]}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend
                  formatter={(value, entry: any) => (
                    <span className="text-xs">{entry.payload.symbol.toUpperCase()}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
