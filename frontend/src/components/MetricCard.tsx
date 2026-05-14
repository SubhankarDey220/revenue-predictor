import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  type?: 'positive' | 'negative' | 'neutral';
  isRange?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, type = 'neutral', isRange = false }) => {
  
  const getColors = () => {
    switch (type) {
      case 'positive': return 'text-neonGreen border-neonGreen/30 bg-neonGreen/5';
      case 'negative': return 'text-neonRed border-neonRed/30 bg-neonRed/5';
      default: return 'text-white border-white/10 bg-darkBg';
    }
  };

  const Icon = type === 'positive' ? ArrowUpRight : type === 'negative' ? ArrowDownRight : Activity;
  const iconColor = type === 'positive' ? 'text-neonGreen' : type === 'negative' ? 'text-neonRed' : 'text-neonCyan';

  return (
    <div className={`p-4 rounded-lg border ${getColors()} transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group`}>
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700 blur-2xl ${iconColor}`}></div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">{title}</h3>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      
      <div className={`text-xl md:text-2xl font-mono font-medium ${isRange ? 'text-lg md:text-xl' : ''}`}>
        {value}
      </div>
    </div>
  );
};

export default MetricCard;
