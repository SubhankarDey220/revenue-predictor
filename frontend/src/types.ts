export interface Company {
  name: string;
  symbol: string;
  cap_type: string;
  sector: string;
}

export interface HistoricalData {
  quarter: string;
  revenue: number;
}

export interface PredictionResult {
  company: string;
  cap_type: string;
  sector: string;
  model_used: string;
  prediction_quarter: string;
  predicted_revenue: number;
  growth_percent: number;
  confidence_range: [number, number];
  accuracy: number;
  historical_data: HistoricalData[];
}

export interface SummaryItem {
  company: string;
  sector: string;
  cap_type: string;
  predicted_revenue: number;
  growth_percent: number;
}
