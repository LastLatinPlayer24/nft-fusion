import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export function AnalysisFilters() {
  const [date, setDate] = React.useState<Date>();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Select defaultValue="aapl">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Symbol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aapl">AAPL</SelectItem>
              <SelectItem value="msft">MSFT</SelectItem>
              <SelectItem value="googl">GOOGL</SelectItem>
              <SelectItem value="tsla">TSLA</SelectItem>
              <SelectItem value="amzn">AMZN</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="7d">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Time Frame" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Analysis Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Analysis</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="fundamental">Fundamental</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
