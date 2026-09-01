'use client';
// Interactive: defers the charting library until after hydration.

import dynamic from 'next/dynamic';

/**
 * Recharts is roughly 130 kB and is not needed to read this page: the summary
 * and the data table carry the same information and render immediately. Loading
 * it with `ssr: false` keeps it out of the route's first-load JavaScript.
 */
const loading = () => <div className="h-full w-full animate-pulse bg-surface-sunken" />;

export const LazyHorizontalBars = dynamic(
  async () => (await import('./chart-visuals')).HorizontalBars,
  { ssr: false, loading },
);

export const LazyPairedBars = dynamic(async () => (await import('./chart-visuals')).PairedBars, {
  ssr: false,
  loading,
});
