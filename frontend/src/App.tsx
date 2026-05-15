import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import { Company, PredictionResult, SummaryItem } from './types';
import { Activity } from 'lucide-react';

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [prediction1, setPrediction1] = useState<PredictionResult | null>(null);
  const [prediction2, setPrediction2] = useState<PredictionResult | null>(null);
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  useEffect(() => {
    fetch('https://revenue-predictor-cd0h.onrender.com/api/companies')
      .then(res => res.json())
      .then(data => setCompanies(data))
      .catch(err => console.error("Error fetching companies:", err));

    fetch('https://revenue-predictor-cd0h.onrender.com/api/summary?quarter=Q1&year=2026')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error("Error fetching summary:", err));
  }, []);

  const handlePredict = async (
    company: string, quarter: string, year: number, 
    company2: string | null = null
  ) => {
    setLoading(true);
    try {
      const res1 = await fetch(`https://revenue-predictor-cd0h.onrender.com/api/predict?company=${encodeURIComponent(company)}&quarter=${quarter}&year=${year}`);
      const data1 = await res1.json();
      setPrediction1(data1);

      if (compareMode && company2) {
        const res2 = await fetch(`https://revenue-predictor-cd0h.onrender.com/api/predict?company=${encodeURIComponent(company2)}&quarter=${quarter}&year=${year}`);
        const data2 = await res2.json();
        setPrediction2(data2);
      } else {
        setPrediction2(null);
      }
    } catch (err) {
      console.error("Error fetching prediction:", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-darkBg text-white flex flex-col font-sans">
      <header className="border-b border-white/10 bg-darkCard/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="text-neonCyan w-6 h-6" />
            <h1 className="text-xl font-semibold tracking-tight">Fin<span className="text-neonCyan">Predict</span> Terminal</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm font-mono text-gray-400">
            <span>STATUS: <span className="text-neonGreen">ONLINE</span></span>
            <span>MODELS: LOADED</span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        <Dashboard 
          companies={companies}
          prediction1={prediction1}
          prediction2={prediction2}
          summary={summary}
          loading={loading}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          onPredict={handlePredict}
        />
      </main>

      <footer className="border-t border-white/10 bg-darkCard/50 py-4 mt-12">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500 font-mono">
          &copy; 2026 FinPredict ML System | Authorized Personnel Only
        </div>
      </footer>
    </div>
  );
}

export default App;
