import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function PredictionChart() {
  const data = [
    { date: '2024-01-01', actual: 180, predicted: null },
    { date: '2024-01-02', actual: 178, predicted: null },
    { date: '2024-01-03', actual: 182, predicted: null },
    { date: '2024-01-04', actual: 185, predicted: null },
    { date: '2024-01-05', actual: 183, predicted: null },
    { date: '2024-01-06', actual: 187, predicted: 188 },
    { date: '2024-01-07', actual: null, predicted: 190 },
    { date: '2024-01-08', actual: null, predicted: 192 },
    { date: '2024-01-09', actual: null, predicted: 189 },
    { date: '2024-01-10', actual: null, predicted: 194 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Price Prediction</CardTitle>
        <CardDescription>
          7-day price forecast for AAPL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  `$${value?.toFixed(2)}`, 
                  name === 'actual' ? 'Actual Price' : 'Predicted Price'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'hsl(var(--chart-2))' }}
                connectNulls={false}
              />
              <ReferenceLine x="2024-01-06" stroke="hsl(var(--border))" strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-primary"></div>
            <span>Actual Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-chart-2 border-dashed"></div>
            <span>AI Prediction</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
