'use client';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const WeightChart = ({
  data,
  goalWeight,
}: {
  data: { label: string; weight: number }[];
  goalWeight: number;
}) => {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-apple-secondary">
        Subí mediciones para ver la evolución.
      </div>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#86868B' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 9, fill: '#86868B' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.05)',
              fontSize: 12,
            }}
          />
          <ReferenceLine
            y={goalWeight}
            stroke="#D32F2F"
            strokeDasharray="4 4"
            label={{
              value: 'Meta',
              position: 'insideTopRight',
              fill: '#D32F2F',
              fontSize: 10,
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#007AFF"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#007AFF' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
