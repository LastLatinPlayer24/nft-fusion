import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TokenPrice {
  symbol: string;
  price_usd: number;
  price_24h_change: string;
}

export function PricesTicker() {
  const [prices, setPrices] = React.useState<TokenPrice[]>([]);

  React.useEffect(() => {
    const load = () =>
      fetch('/api/prices?symbols=ETH,BTC,SOL,MATIC,BNB')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setPrices(data.filter((d: TokenPrice) => d.price_usd));
        })
        .catch(() => {});

    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (prices.length === 0) return null;

  return (
    <div className="border-b bg-muted/30 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-1 overflow-x-auto scrollbar-none">
        {prices.map((p) => {
          const change = parseFloat(p.price_24h_change ?? '0');
          const positive = change >= 0;
          return (
            <div key={p.symbol} className="flex items-center gap-1.5 shrink-0 text-xs">
              <span className="font-semibold">{p.symbol}</span>
              <span>${p.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`flex items-center gap-0.5 ${positive ? 'text-green-500' : 'text-red-500'}`}>
                {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {positive ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
