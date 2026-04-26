import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getHottestCollections, type NFTCollection } from '@/services/api';

export function AnalysisFilters() {
  const [collections, setCollections] = React.useState<NFTCollection[]>([]);
  const [selected, setSelected] = React.useState('');
  const [timeframe, setTimeframe] = React.useState('24h');
  const [analysisType, setAnalysisType] = React.useState('all');

  React.useEffect(() => {
    getHottestCollections(10)
      .then(cols => {
        setCollections(cols);
        if (cols[0]) setSelected(cols[0].collection_address);
      })
      .catch(() => {});
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select collection" />
            </SelectTrigger>
            <SelectContent>
              {collections.map(c => (
                <SelectItem key={c.collection_address} value={c.collection_address}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 Hour</SelectItem>
              <SelectItem value="6h">6 Hours</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Analysis Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Signals</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="floor">Floor Price</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
            </SelectContent>
          </Select>

          <Button>Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  );
}
