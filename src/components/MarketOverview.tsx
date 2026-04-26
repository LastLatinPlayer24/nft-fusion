import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp } from 'lucide-react';
import { getHottestCollections, proxyImg, type NFTCollection } from '@/services/api';

function fmtUSD(s?: string) {
  const v = parseFloat(s ?? '0');
  if (isNaN(v)) return '$0';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function MarketOverview() {
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    getHottestCollections(4)
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Collections (24h)
        </CardTitle>
        <CardDescription>Highest volume NFT collections right now</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading...
          </div>
        ) : (
          <div className="space-y-3">
            {collections.map((c, i) => (
              <div key={c.collection_address ?? i} className="flex items-center gap-3 pb-3 border-b last:border-b-0">
                {proxyImg(c.collection_image) ? (
                  <img src={proxyImg(c.collection_image)} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium truncate">{c.name}</h4>
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                      {fmtUSD(c.volume_usd)} vol
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Floor {c.floor_price} ETH · {c.transactions_count ?? 0} txns
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
