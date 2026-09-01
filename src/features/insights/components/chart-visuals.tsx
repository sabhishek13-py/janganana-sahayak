'use client';
// Interactive: Recharts renders in the browser and resizes with its container.

import { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartDatum } from '../lib/chart-data';

const PRIMARY = '#0b7f76';
const SECONDARY = '#94a3b8';
/** The adjacent data table carries the same numbers, so the drawing is decorative. */
const DECORATIVE = { 'aria-hidden': true } as const;
/** Twelve rows keeps the axis readable; the table below holds all 36. */
const VISIBLE_ROWS = 12;

export interface HorizontalBarsProps {
  readonly data: readonly ChartDatum[];
  readonly unit: string;
}

export const HorizontalBars = memo(function HorizontalBars({ data, unit }: HorizontalBarsProps) {
  const rows = useMemo(() => data.slice(0, VISIBLE_ROWS), [data]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={[...rows]} layout="vertical" margin={{ left: 8, right: 16 }} {...DECORATIVE}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" unit={unit} tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="code" width={44} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value: number) => `${value}${unit}`} />
        <Bar dataKey="value" fill={PRIMARY} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

export interface PairedBarsProps {
  readonly data: readonly ChartDatum[];
  readonly firstLabel: string;
  readonly secondLabel: string;
}

export const PairedBars = memo(function PairedBars({
  data,
  firstLabel,
  secondLabel,
}: PairedBarsProps) {
  const rows = useMemo(() => data.slice(0, VISIBLE_ROWS), [data]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={[...rows]} margin={{ left: 8, right: 16 }} {...DECORATIVE}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="code" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" name={firstLabel} fill={PRIMARY} radius={[4, 4, 0, 0]} />
        <Bar dataKey="secondary" name={secondLabel} fill={SECONDARY} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});
