import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, ReferenceDot } from 'recharts';
import { HistoricalData } from '../types';

interface PredictionChartProps {
  data: HistoricalData[];
  predictedValue: number;
  predictedQuarter: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({ data, predictedValue, predictedQuarter }) => {

  const chartData = useMemo(() => {
    // We create a continuous line from historical to predicted
    const lastHistorical = data[data.length - 1];
    
    const formattedData = data.map((item, index) => ({
      name: item.quarter,
      historical: item.revenue,
      predicted: index === data.length - 1 ? item.revenue : null,
      confidenceLow: null,
      confidenceHigh: null
    }));

    // Add predicted point
    formattedData.push({
      name: predictedQuarter,
      historical: null as any,
      predicted: predictedValue,
      confidenceLow: predictedValue * 0.95,
      confidenceHigh: predictedValue * 1.05
    });

    return formattedData;
  }, [data, predictedValue, predictedQuarter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkCard/90 border border-white/10 p-3 rounded shadow-xl backdrop-blur font-mono text-sm">
          <p className="text-gray-400 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.dataKey === 'confidenceHigh' || entry.dataKey === 'confidenceLow') return null;
            return (
              <p key={index} style={{ color: entry.color }} className="font-semibold">
                {entry.name === 'historical' ? 'Actual: ' : 'Predicted: '}
                ₹{entry.value.toLocaleString()} Cr
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#9ca3af" 
          tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }} 
          tickLine={false}
          axisLine={{ stroke: '#ffffff20' }}
        />
        <YAxis 
          stroke="#9ca3af" 
          tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Confidence Band */}
        <Area 
          type="monotone" 
          dataKey="confidenceHigh" 
          stroke="none" 
          fill="url(#colorPredicted)" 
          isAnimationActive={true}
        />
        <Area 
          type="monotone" 
          dataKey="confidenceLow" 
          stroke="none" 
          fill="#0a0e17" 
          isAnimationActive={true}
        />

        <Line 
          type="monotone" 
          dataKey="historical" 
          stroke="#10b981" 
          strokeWidth={2} 
          dot={{ r: 4, fill: '#0a0e17', stroke: '#10b981', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#10b981', stroke: '#0a0e17', strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={1500}
        />
        
        <Line 
          type="monotone" 
          dataKey="predicted" 
          stroke="#06b6d4" 
          strokeWidth={2} 
          strokeDasharray="5 5"
          dot={{ r: 4, fill: '#0a0e17', stroke: '#06b6d4', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0a0e17', strokeWidth: 2 }}
          isAnimationActive={true}
          animationDuration={1500}
        />

        <ReferenceDot x={predictedQuarter} y={predictedValue} r={6} fill="#06b6d4" stroke="none" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default PredictionChart;
