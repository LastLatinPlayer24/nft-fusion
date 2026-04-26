import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, Wallet, ImageOff } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { getWalletNFTs, type WalletNFT } from '@/services/api';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--muted-foreground))',
];

function groupByCollection(nfts: WalletNFT[]) {
  const counts: Record<string, number> = {};
  for (const nft of nfts) {
    const key = nft.collection?.name ?? nft.contract.name ?? 'Unknown';
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
}

export function PortfolioChart() {
  const { account, isConnected } = useWeb3();
  const [data, setData] = React.useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!account) { setData([]); return; }
    setLoading(true);
    getWalletNFTs(account, 100)
      .then(r => setData(groupByCollection(r.ownedNfts)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [account]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>NFT Collection Breakdown</CardTitle>
        <CardDescription>
          {isConnected ? 'Your NFTs grouped by collection' : 'Connect wallet to view breakdown'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Wallet className="h-10 w-10 opacity-30" />
            <p className="text-sm">Connect your MetaMask wallet</p>
          </div>
        ) : loading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading NFTs...
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ImageOff className="h-10 w-10 opacity-30" />
            <p className="text-sm">No NFTs found in this wallet.</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name.length > 10 ? name.slice(0, 9) + '…' : name}: ${value}`
                  }
                  labelLine={false}
                >
                  {data.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
