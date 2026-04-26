import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ImageOff, ExternalLink, TrendingUp } from 'lucide-react';
import { getTopCollections, searchCollections, type OpenSeaCollection } from '@/services/api';

export default function Collections() {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<OpenSeaCollection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searching, setSearching] = React.useState(false);

  // Load top collections on mount
  React.useEffect(() => {
    getTopCollections(24)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (!query || query.length < 2) return;
    const t = setTimeout(() => {
      setSearching(true);
      searchCollections(query)
        .then(setResults)
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleClearSearch = () => {
    setQuery('');
    setLoading(true);
    getTopCollections(24)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  };

  const isLoading = loading || searching;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">NFT Collections</h1>
          <p className="text-muted-foreground mt-2">Browse and discover top NFT collections on Ethereum</p>
        </div>
        <Badge variant="outline" className="w-fit flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Top by 7-day volume
        </Badge>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search collections by name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        {query && (
          <Button variant="outline" onClick={handleClearSearch}>Clear</Button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading collections...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageOff className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p>No collections found{query ? ` for "${query}"` : ''}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((c, i) => (
            <Card key={c.collection ?? i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              {/* Banner */}
              <div className="h-24 bg-gradient-to-br from-primary/20 to-muted relative overflow-hidden">
                {c.banner_image_url ? (
                  <img
                    src={c.banner_image_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 via-muted to-background" />
                )}
                {/* Collection icon */}
                <div className="absolute bottom-0 left-4 translate-y-1/2">
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt=""
                      className="w-12 h-12 rounded-full border-2 border-background object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                      <ImageOff className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="pt-8 pb-4 px-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm leading-tight truncate">{c.name}</h3>
                  {c.project_url && (
                    <a
                      href={c.project_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground flex-shrink-0" />
                    </a>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {c.floor_price !== undefined && (
                    <div className="p-2 bg-muted rounded">
                      <div className="text-muted-foreground">Floor</div>
                      <div className="font-mono font-semibold">{c.floor_price} ETH</div>
                    </div>
                  )}
                  {c.seven_day_volume !== undefined && (
                    <div className="p-2 bg-muted rounded">
                      <div className="text-muted-foreground">7d Volume</div>
                      <div className="font-mono font-semibold">{c.seven_day_volume.toFixed(1)} ETH</div>
                    </div>
                  )}
                  {c.total_supply !== undefined && (
                    <div className="p-2 bg-muted rounded col-span-2">
                      <div className="text-muted-foreground">Supply</div>
                      <div className="font-mono font-semibold">{c.total_supply.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                {c.twitter_username && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">@{c.twitter_username}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
