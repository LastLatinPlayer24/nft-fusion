import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
}

const SORT_OPTIONS = [
  { value: 'volume', label: 'Volume 24h' },
  { value: 'floor', label: 'Floor Price' },
  { value: 'buyers', label: 'Buyers' },
  { value: 'txns', label: 'Transactions' },
];

export function MarketFilters({ search, onSearch, sortBy, onSortChange }: Props) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const SortSelect = ({ className }: { className?: string }) => (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className={className ?? 'w-[160px]'}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(o => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <Card>
      <CardContent className="p-4">
        {/* Mobile */}
        <div className="md:hidden space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              className="pl-10"
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Sort & Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[300px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Sort Collections</SheetTitle>
              </SheetHeader>
              <div className="space-y-4">
                <SortSelect className="w-full" />
                <Button className="w-full" onClick={() => setIsFilterOpen(false)}>Apply</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections by name..."
              className="pl-10"
              value={search}
              onChange={e => onSearch(e.target.value)}
            />
          </div>
          <SortSelect />
          {search && (
            <Button variant="outline" onClick={() => onSearch('')}>Clear</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
