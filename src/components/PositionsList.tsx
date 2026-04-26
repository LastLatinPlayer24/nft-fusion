import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageOff, Loader2, Wallet } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getWalletNFTs, type WalletNFT } from '@/services/api';

export function PositionsList() {
  const { account, isConnected } = useWeb3();
  const [nfts, setNfts] = React.useState<WalletNFT[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [total, setTotal] = React.useState(0);

  React.useEffect(() => {
    if (!account) { setNfts([]); return; }
    setLoading(true);
    getWalletNFTs(account, 20)
      .then(r => { setNfts(r.ownedNfts); setTotal(r.totalCount); })
      .catch(() => setNfts([]))
      .finally(() => setLoading(false));
  }, [account]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Holdings</CardTitle>
        <CardDescription>
          {isConnected ? `${total} NFTs in wallet` : 'Connect wallet to view NFTs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
            <Wallet className="h-8 w-8 opacity-40" />
            <p className="text-sm">Connect your MetaMask wallet</p>
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading NFTs...</span>
          </div>
        ) : nfts.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
            <ImageOff className="h-8 w-8 opacity-40" />
            <p className="text-sm">No NFTs found in this wallet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {nfts.slice(0, 10).map((nft, i) => (
              <div key={`${nft.contract.address}-${nft.tokenId}-${i}`} className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3">
                {nft.image?.thumbnailUrl ? (
                  <img
                    src={nft.image.thumbnailUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageOff className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {nft.name ?? `${nft.contract.name ?? 'NFT'} #${nft.tokenId}`}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {nft.collection?.name ?? nft.contract.name ?? nft.contract.address.slice(0, 10) + '...'}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  #{nft.tokenId.length > 6 ? nft.tokenId.slice(0, 6) + '…' : nft.tokenId}
                </Badge>
              </div>
            ))}
            {total > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing 10 of {total} NFTs
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
