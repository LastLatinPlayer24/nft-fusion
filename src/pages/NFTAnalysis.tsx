import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Brain, TrendingUp, TrendingDown, ImageOff } from 'lucide-react';
import { getHottestCollections, analyzeNFT, type NFTCollection } from '@/services/api';

export default function NFTAnalysis() {
  const [query, setQuery] = React.useState('');
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [selected, setSelected] = React.useState<NFTCollection | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [loadingCollections, setLoadingCollections] = React.useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);

  React.useEffect(() => {
    getHottestCollections(10)
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoadingCollections(false));
  }, []);

  const filtered = query.length > 1
    ? collections.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : collections;

  const handleAnalyze = async (c: NFTCollection) => {
    setSelected(c);
    setAnalysis(null);
    setLoadingAnalysis(true);
    const contextData = `Name: ${c.name}\nFloor: ${c.floor_price} ETH ($${c.floor_price_usd})\nVolume 24h: $${c.volume_usd}\nAvg sale: $${c.average_price_usd}\nBuyers: ${c.buyers_count}, Sellers: ${c.sellers_count}, Transactions: ${c.transactions_count}`;
    try {
      const r = await analyzeNFT(c.name, contextData);
      setAnalysis(r.analysis);
    } catch {
      setAnalysis('Analysis failed. Check your API key or try again.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">NFT Analysis</h1>
        <p className="text-muted-foreground mt-2">
          Select a collection for AI-powered market analysis
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filter collections..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection list */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Top NFT Collections (24h)
          </h2>
          {loadingCollections ? (
            <div className="flex items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading collections...</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No collections found.</p>
          ) : (
            filtered.map((c, i) => {
              const floorNum = parseFloat(c.floor_price ?? '0');
              const avgNum = parseFloat(c.average_price_usd ?? '0');
              const floorUsd = parseFloat(c.floor_price_usd ?? '0');
              const isBullish = avgNum > floorUsd;
              return (
                <Card
                  key={c.collection_address ?? i}
                  className={`cursor-pointer transition-all hover:shadow-md ${selected?.collection_address === c.collection_address ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => handleAnalyze(c)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {c.collection_image ? (
                        <img src={c.collection_image} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm truncate">{c.name}</span>
                          <Badge variant={isBullish ? 'default' : 'destructive'} className="text-xs flex-shrink-0">
                            {isBullish ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {isBullish ? 'Bullish' : 'Bearish'}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>Floor: {floorNum.toFixed(3)} ETH</span>
                          <span>Txns: {c.transactions_count ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Analysis panel */}
        <div>
          {!selected ? (
            <Card className="h-full flex items-center justify-center border-dashed">
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a collection to get AI analysis</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selected.collection_image && (
                    <img src={selected.collection_image} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      {selected.name}
                    </CardTitle>
                    <CardDescription>AI Analysis powered by Claude</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-muted-foreground text-xs">Floor Price</div>
                    <div className="font-bold">{selected.floor_price} ETH</div>
                    <div className="text-xs text-muted-foreground">${parseFloat(selected.floor_price_usd ?? '0').toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-muted-foreground text-xs">Volume 24h</div>
                    <div className="font-bold">${parseFloat(selected.volume_usd ?? '0').toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-muted-foreground">{selected.transactions_count} txns</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-muted-foreground text-xs">Buyers</div>
                    <div className="font-bold">{selected.buyers_count ?? 0}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-muted-foreground text-xs">Sellers</div>
                    <div className="font-bold">{selected.sellers_count ?? 0}</div>
                  </div>
                </div>

                {/* AI Analysis */}
                {loadingAnalysis ? (
                  <div className="flex items-center gap-2 py-4 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Claude is analyzing {selected.name}...</span>
                  </div>
                ) : analysis ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">AI Analysis</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{analysis}</p>
                  </div>
                ) : null}

                <Button className="w-full" onClick={() => handleAnalyze(selected)} disabled={loadingAnalysis}>
                  {loadingAnalysis ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                  Re-analyze
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
