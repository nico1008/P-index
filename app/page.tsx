import sources from '../data/sources.json';
import Dashboard from './Dashboard';
import type { Source } from './types';

export default function Page() {
  return <Dashboard sources={sources as Source[]} />;
}
