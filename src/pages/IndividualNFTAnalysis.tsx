import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Loader2, ArrowLeft, ImageOff } from 'lucide-react';
import { getHottestCollections, analyzeNFT, proxyImg, type NFTCollection } from '@/services/api';

const IndividualNFTAnalysis: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = React.useState<NFTCollection | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [loadingCollection, setLoadingCollection] = React.useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);
  const [notFound, setNotFound] = React.useState(false);

  const runAnalysis = React.useCallback(async (c: NFTCollection) => {
    setAnalysis(null);
    setLoadingAnalysis(true);
    const ctx = `Name: ${c.name}\nFloor: ${c.floor_price} ETH ($${c.floor_price_usd})\nVolume 24h: $${c.volume_usd}\nAvg sale: $${c.average_price_usd}\nBuyers: ${c.buyers_count}, Sellers: ${c.sellers_count}, Txns: ${c.transactions_count}`;
    try {
      const r = await analyzeNFT(c.name, ctx);
      setAnalysis(r.analysis);
    } catch {
      setAnalysis('Analysis unavailable. Try again.');
    } finally {
      setLoadingAnalysis(false);
    }
  }, []);

  React.useEffect(() => {
    if (!id) return;
    getHottestCollections(20)
      .then(cols => {
        const found = cols.find(c => c.collection_address === id);
        if (found) {
          setCollection(found);
          runAnalysis(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingCollection(false));
  }, [id, runAnalysis]);

  if (loadingCollection) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading collection...
      </div>
    );
  }

  if (notFound || !collection) {
    return (
      <div className="space-y-4">
        <Link to="/nft-analysis">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <p className="text-muted-foreground">Collection not found.</p>
      </div>
    );
  }

  const floorUsd = parseFloat(collection.floor_price_usd ?? '0');
  const avgUsd = parseFloat(collection.average_price_usd ?? '0');
  const isBullish = avgUsd > floorUsd;
  const imgSrc = proxyImg(collection.collection_image);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/nft-analysis">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <Badge variant={isBullish ? 'default' : 'destructive'} className="flex items-center gap-1">
          {isBullish ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isBullish ? 'Bullish' : 'Bearish'}
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {imgSrc ? (
          <img src={imgSrc} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{collection.name}</h1>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[260px]">
            {collection.collection_address}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Floor Price', value: `${parseFloat(collection.floor_price ?? '0').toFixed(3)} ETH`, sub: `$${floorUsd.toLocaleString()}` },
          { label: '24h Volume', value: `$${parseFloat(collection.volume_usd ?? '0').toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: `${collection.transactions_count ?? 0} txns` },
          { label: 'Buyers', value: String(collection.buyers_count ?? 0), sub: '24h unique' },
          { label: 'Sellers', value: String(collection.sellers_count ?? 0), sub: '24h unique' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Analysis
          </CardTitle>
          <CardDescription>Powered by Groq · llama-3.3-70b</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAnalysis ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Analyzing {collection.name}...</span>
            </div>
          ) : analysis ? (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{analysis}</p>
            </div>
          ) : null}
          <Button
            className="w-full"
            onClick={() => runAnalysis(collection)}
            disabled={loadingAnalysis}
          >
            {loadingAnalysis
              ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              : <Brain className="h-4 w-4 mr-2" />}
            Re-analyze
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndividualNFTAnalysis;
