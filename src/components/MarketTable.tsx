import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Loader2, ImageOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getHottestCollections, type NFTCollection } from '@/services/api';

function fmt(n: string | undefined, prefix = '$'): string {
  const v = parseFloat(n ?? '0');
  if (isNaN(v)) return 'N/A';
  if (v >= 1_000_000) return `${prefix}${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${prefix}${(v / 1_000).toFixed(1)}K`;
  return `${prefix}${v.toFixed(2)}`;
}

export function MarketTable() {
  const { t } = useLanguage();
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getHottestCollections(20)
      .then(setCollections)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading NFT collections...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Could not load market data.</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  const MobileView = () => (
    <div className="md:hidden space-y-3">
      {collections.map((c, i) => (
        <Card key={c.collection_address ?? i} className="p-3 cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {c.collection_image ? (
                  <img src={c.collection_image} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">
                    {c.collection_address?.slice(0, 8)}...
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="font-mono text-sm font-bold">{fmt(c.floor_price_usd)}</div>
                <div className="text-xs text-muted-foreground">{c.floor_price} ETH</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div><span className="font-medium text-foreground">{c.transactions_count ?? 0}</span> txns</div>
              <div><span className="font-medium text-foreground">{c.buyers_count ?? 0}</span> buyers</div>
              <div>Vol: {fmt(c.volume_usd)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const DesktopView = () => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>{t('common.name')}</TableHead>
            <TableHead className="text-right">Floor Price</TableHead>
            <TableHead className="text-right">Volume (24h)</TableHead>
            <TableHead className="text-right">Avg Sale</TableHead>
            <TableHead className="text-right">Buyers</TableHead>
            <TableHead className="text-right">Txns</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {collections.map((c, i) => (
            <TableRow key={c.collection_address ?? i} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {c.collection_image ? (
                    <img src={c.collection_image} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0" />
                  )}
                  <span className="font-medium">{c.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">
                <div>{fmt(c.floor_price_usd)}</div>
                <div className="text-xs text-muted-foreground">{c.floor_price} ETH</div>
              </TableCell>
              <TableCell className="text-right font-mono">
                <div className="flex items-center justify-end gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  {fmt(c.volume_usd)}
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">{fmt(c.average_price_usd)}</TableCell>
              <TableCell className="text-right">{c.buyers_count ?? 0}</TableCell>
              <TableCell className="text-right">
                <Badge variant="outline" className="text-xs">{c.transactions_count ?? 0}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
}
