import React from 'react';
import InputSection from './InputSection';
import MetricCard from './MetricCard';
import PredictionChart from './PredictionChart';
import SummaryTable from './SummaryTable';
import { Company, PredictionResult, SummaryItem } from '../types';
import { Download } from 'lucide-react';

interface DashboardProps {
  companies: Company[];
  prediction1: PredictionResult | null;
  prediction2: PredictionResult | null;
  summary: SummaryItem[];
  loading: boolean;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  onPredict: (c1: string, q: string, y: number, c2: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  companies, prediction1, prediction2, summary, loading, compareMode, setCompareMode, onPredict
}) => {

  const renderPredictionPanel = (pred: PredictionResult | null, title: string) => {
    if (!pred && !loading) return null;

    if (loading) {
      return (
        <div className="glass-panel p-6 rounded-xl animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded"></div>)}
          </div>
          <div className="h-64 bg-white/5 rounded"></div>
        </div>
      );
    }

    if (!pred) return null;

    return (
      <div className="glass-panel p-6 rounded-xl transition-all duration-500 ease-in-out hover:border-white/20">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-4">
            <img 
              src={`https://logo.dev/${pred.company.toLowerCase().replace(' ', '')}.com?token=pk_free_placeholder`} 
              alt="logo" 
              className="w-10 h-10 rounded-full bg-white/10 p-1"
              onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name='+pred.company+'&background=random'; }}
            />
            <div>
              <h2 className="text-2xl font-semibold tracking-wide">{pred.company}</h2>
              <div className="flex space-x-2 mt-1">
                <span className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-300 font-mono">{pred.sector}</span>
                <span className={`px-2 py-0.5 text-xs rounded font-mono ${
                  pred.cap_type === 'Large' ? 'bg-blue-500/20 text-blue-400' :
                  pred.cap_type === 'Mid' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'
                }`}>{pred.cap_type} Cap</span>
                <span className="px-2 py-0.5 text-xs rounded bg-neonCyan/20 text-neonCyan font-mono border border-neonCyan/30">
                  {pred.model_used}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 font-mono">TARGET QTR</div>
            <div className="text-xl font-mono text-white">{pred.prediction_quarter}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard title="Predicted Revenue" value={`₹${pred.predicted_revenue.toLocaleString()} Cr`} type="neutral" />
          <MetricCard title="Growth vs Prev Qtr" value={`${pred.growth_percent > 0 ? '+' : ''}${pred.growth_percent}%`} type={pred.growth_percent >= 0 ? "positive" : "negative"} />
          <MetricCard title="Confidence Range" value={`₹${pred.confidence_range[0]} - ${pred.confidence_range[1]}`} type="neutral" isRange />
          <MetricCard title="Model Accuracy" value={`±${pred.accuracy}%`} type="neutral" />
        </div>

        <div className="mt-4">
          <h3 className="text-sm text-gray-400 font-mono mb-4 uppercase tracking-wider">Historical vs Predicted</h3>
          <div className="h-72 w-full">
            <PredictionChart data={pred.historical_data} predictedValue={pred.predicted_revenue} predictedQuarter={pred.prediction_quarter} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <InputSection 
        companies={companies} 
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        onPredict={onPredict}
        loading={loading}
      />

      {compareMode && (prediction1 || loading) ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {renderPredictionPanel(prediction1, "Company 1")}
          {renderPredictionPanel(prediction2, "Company 2")}
        </div>
      ) : (
        renderPredictionPanel(prediction1, "Prediction")
      )}

      {prediction1 && !loading && (
        <div className="flex justify-end space-x-3 mb-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-darkCard border border-white/10 hover:border-white/30 rounded text-sm font-mono transition-colors">
            <Download className="w-4 h-4" /> <span>Export PDF</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-darkCard border border-white/10 hover:border-white/30 rounded text-sm font-mono transition-colors">
            <Download className="w-4 h-4" /> <span>Export CSV</span>
          </button>
        </div>
      )}

      {summary.length > 0 && (
        <div className="mt-12 glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-neonCyan mr-3 animate-pulse"></span>
            Market Overview - Q1 2026 Predictions
          </h3>
          <SummaryTable data={summary} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
