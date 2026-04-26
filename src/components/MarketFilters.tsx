import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/contexts/LanguageContext';

export function MarketFilters() {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const FilterContent = () => (
    <div className="space-y-4">
      <Select defaultValue="all">
        <SelectTrigger>
          <SelectValue placeholder={t('market.allSectors')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('market.allSectors')}</SelectItem>
          <SelectItem value="tech">{t('market.technology')}</SelectItem>
          <SelectItem value="finance">{t('market.finance')}</SelectItem>
          <SelectItem value="healthcare">{t('market.healthcare')}</SelectItem>
          <SelectItem value="energy">{t('market.energy')}</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger>
          <SelectValue placeholder="Market Cap" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Caps</SelectItem>
          <SelectItem value="large">Large Cap</SelectItem>
          <SelectItem value="mid">Mid Cap</SelectItem>
          <SelectItem value="small">Small Cap</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        className="w-full" 
        onClick={() => setIsFilterOpen(false)}
      >
        {t('market.applyFilters')}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-4">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t('market.search')}
              className="pl-10"
            />
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[400px]">
              <SheetHeader className="mb-6">
                <SheetTitle>Market Filters</SheetTitle>
              </SheetHeader>
              <FilterContent />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('market.search')}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('market.allSectors')}</SelectItem>
              <SelectItem value="tech">{t('market.technology')}</SelectItem>
              <SelectItem value="finance">{t('market.finance')}</SelectItem>
              <SelectItem value="healthcare">{t('market.healthcare')}</SelectItem>
              <SelectItem value="energy">{t('market.energy')}</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Market Cap" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Caps</SelectItem>
              <SelectItem value="large">Large Cap</SelectItem>
              <SelectItem value="mid">Mid Cap</SelectItem>
              <SelectItem value="small">Small Cap</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            {t('market.applyFilters')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
