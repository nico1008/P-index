export type ChartType = 'line' | 'linezero' | 'bar' | 'heatmap' | 'twoline';
export type Trend = 'up' | 'down' | 'stable';

export interface Source {
  id: string;
  name: string;
  label: string;
  score: number;
  weight: number;
  currentValue: string;
  chartType: ChartType;
  trend: Trend;
  data: number[];
  data2?: number[];
  tLabels: string[];
  description: string;
}
