import React, { useState } from 'react';
import { Company } from '../types';
import { Search, Zap } from 'lucide-react';

interface InputSectionProps {
  companies: Company[];
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  onPredict: (c1: string, q: string, y: number, c2: string | null) => void;
  loading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ companies, compareMode, setCompareMode, onPredict, loading }) => {
  const [comp1, setComp1] = useState('');
  const [comp2, setComp2] = useState('');
  const [quarter, setQuarter] = useState('Q1');
  const [year, setYear] = useState(2026);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comp1) {
      onPredict(comp1, quarter, year, compareMode ? comp2 : null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonCyan via-neonGreen to-neonCyan opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white flex items-center">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          Query Parameters
        </h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-mono text-gray-400 cursor-pointer">
            <input 
              type="checkbox" 
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="mr-2 accent-neonCyan"
            />
            COMPARE MODE
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        <div className={compareMode ? "col-span-12 md:col-span-3" : "col-span-12 md:col-span-5"}>
          <label className="block text-xs font-mono text-gray-400 mb-2">TARGET ASSET 1</label>
          <input 
            type="text"
            value={comp1}
            onChange={(e) => setComp1(e.target.value)}
            placeholder="e.g. Reliance Industries"
            list="companies-list"
            required
            className="w-full bg-darkBg border border-white/10 rounded px-4 py-2.5 text-white font-mono focus:outline-none focus:border-neonCyan focus:ring-1 focus:ring-neonCyan transition-all"
          />
        </div>

        {compareMode && (
          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-mono text-gray-400 mb-2">TARGET ASSET 2</label>
            <input 
              type="text"
              value={comp2}
              onChange={(e) => setComp2(e.target.value)}
              placeholder="e.g. TCS"
              list="companies-list"
              className="w-full bg-darkBg border border-white/10 rounded px-4 py-2.5 text-white font-mono focus:outline-none focus:border-neonCyan focus:ring-1 focus:ring-neonCyan transition-all"
            />
          </div>
        )}

        <div className="col-span-6 md:col-span-2">
          <label className="block text-xs font-mono text-gray-400 mb-2">QUARTER</label>
          <select 
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full bg-darkBg border border-white/10 rounded px-4 py-2.5 text-white font-mono focus:outline-none focus:border-neonCyan transition-all"
          >
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <div className="col-span-6 md:col-span-2">
          <label className="block text-xs font-mono text-gray-400 mb-2">YEAR</label>
          <select 
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full bg-darkBg border border-white/10 rounded px-4 py-2.5 text-white font-mono focus:outline-none focus:border-neonCyan transition-all"
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="col-span-12 md:col-span-3 lg:col-span-2">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neonGreen/10 hover:bg-neonGreen/20 text-neonGreen border border-neonGreen/50 rounded px-4 py-2.5 font-mono font-medium flex items-center justify-center transition-all neon-glow-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">COMPUTING...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                PREDICT
              </>
            )}
          </button>
        </div>
      </div>

      <datalist id="companies-list">
        {companies.map(c => <option key={c.symbol} value={c.name}>{c.symbol}</option>)}
      </datalist>
    </form>
  );
};

export default InputSection;
