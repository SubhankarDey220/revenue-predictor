import React from 'react';
import { SummaryItem } from '../types';

interface SummaryTableProps {
  data: SummaryItem[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-xs font-mono text-gray-400 uppercase tracking-wider">
            <th className="pb-3 px-4 font-medium">Company</th>
            <th className="pb-3 px-4 font-medium">Sector</th>
            <th className="pb-3 px-4 font-medium">Cap Type</th>
            <th className="pb-3 px-4 text-right font-medium">Predicted Rev (₹ Cr)</th>
            <th className="pb-3 px-4 text-right font-medium">Growth %</th>
          </tr>
        </thead>
        <tbody className="text-sm font-mono">
          {data.map((item, index) => (
            <tr 
              key={index} 
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-4 font-sans font-medium text-white">
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://logo.dev/${item.company.toLowerCase().replace(' ', '')}.com?token=pk_free_placeholder`} 
                    alt="logo" 
                    className="w-6 h-6 rounded-full bg-white/10 p-0.5"
                    onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name='+item.company+'&background=random'; }}
                  />
                  <span>{item.company}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-300">{item.sector}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 text-xs rounded ${
                  item.cap_type === 'Large' ? 'bg-blue-500/10 text-blue-400' :
                  item.cap_type === 'Mid' ? 'bg-purple-500/10 text-purple-400' : 'bg-orange-500/10 text-orange-400'
                }`}>{item.cap_type}</span>
              </td>
              <td className="py-3 px-4 text-right tabular-nums">
                {item.predicted_revenue.toLocaleString()}
              </td>
              <td className={`py-3 px-4 text-right tabular-nums font-semibold ${item.growth_percent >= 0 ? 'text-neonGreen' : 'text-neonRed'}`}>
                {item.growth_percent >= 0 ? '+' : ''}{item.growth_percent.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SummaryTable;
