import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export function PortfolioChart() {
  const data = [
    { name: 'Technology', value: 35, color: 'hsl(var(--chart-1))' },
    { name: 'Finance', value: 20, color: 'hsl(var(--chart-2))' },
    { name: 'Healthcare', value: 15, color: 'hsl(var(--chart-3))' },
    { name: 'Energy', value: 12, color: 'hsl(var(--chart-4))' },
    { name: 'Consumer', value: 10, color: 'hsl(var(--chart-5))' },
    { name: 'Other', value: 8, color: 'hsl(var(--muted))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Allocation</CardTitle>
        <CardDescription>
          Distribution by sector
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
