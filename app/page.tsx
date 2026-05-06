import release from '../data/sources.json';
import Dashboard from './Dashboard';
import type { Release } from './types';

export default function Page() {
  return <Dashboard release={release as Release} />;
}
