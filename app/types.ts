export type ChartType = 'line' | 'linezero' | 'bar' | 'heatmap' | 'twoline';
export type Trend = 'up' | 'down' | 'stable';
export type Cadence = 'daily' | 'monthly' | 'quarterly' | 'annual';
export type DataQuality = 'official' | 'estimated' | 'modeled';

export interface Source {
  id: string;
  name: string;
  label: string;
  score: number;
  weight: number;
  currentValue: string;
  rawValue?: number;
  chartType: ChartType;
  trend: Trend;
  data: number[];
  data2?: number[];
  tLabels: string[];
  description: string;
  sourceUrl: string;
  sourceName: string;
  whyItMatters: string;
  cadence: Cadence;
  dataQuality: DataQuality;
  lastFetched: string;
  staleSince?: string;
}

export interface Release {
  releaseDate: string;
  lastRunAt: string;
  composite: number;
  picture?: string | null;
  sources: Source[];
}
