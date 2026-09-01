'use client';
// Interactive: highlights a tile on hover so the reader can trace one territory.

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { ALL_SCHEDULES, NOTIFIED_COUNT } from '../lib/schedule-lookup';

import { CARTOGRAM_GRID, COLUMNS, GAP, ROWS, TILE } from './cartogram-grid';

interface TileProps {
  readonly code: string;
  readonly row: number;
  readonly col: number;
  readonly isNotified: boolean;
  readonly isHovered: boolean;
  readonly onHover: (code: string | undefined) => void;
}

function Tile({ code, row, col, isNotified, isHovered, onHover }: TileProps) {
  const x = col * (TILE + GAP);
  const y = row * (TILE + GAP);
  return (
    <g
      onMouseEnter={() => {
        onHover(code);
      }}
      onMouseLeave={() => {
        onHover(undefined);
      }}
    >
      <rect
        x={x}
        y={y}
        width={TILE}
        height={TILE}
        rx={0}
        className={isNotified ? 'fill-primary-600' : 'fill-line'}
        stroke={isHovered ? '#10162a' : 'transparent'}
        strokeWidth={2}
      />
      <text
        x={x + TILE / 2}
        y={y + TILE / 2 + 5}
        textAnchor="middle"
        fontSize="14"
        fontWeight={600}
        className={isNotified ? 'fill-white' : 'fill-ink'}
      >
        {code}
      </text>
    </g>
  );
}

function Tiles({
  hovered,
  onHover,
}: {
  readonly hovered: string | undefined;
  readonly onHover: (code: string | undefined) => void;
}) {
  return (
    <>
      {ALL_SCHEDULES.map((schedule) => {
        const position = CARTOGRAM_GRID[schedule.territory.code];
        if (position === undefined) return null;
        return (
          <Tile
            key={schedule.territory.code}
            code={schedule.territory.code}
            row={position[0]}
            col={position[1]}
            isNotified={schedule.status === 'NOTIFIED'}
            isHovered={hovered === schedule.territory.code}
            onHover={onHover}
          />
        );
      })}
    </>
  );
}

function Legend({ summary }: { readonly summary: string }) {
  const t = useTranslations('schedule');
  return (
    <figcaption className="space-y-3 text-meta text-ink-subtle">
      <p className="max-w-[62ch] leading-[1.6]">{summary}</p>
      <ul className="flex flex-wrap gap-5 text-[0.6875rem] font-extrabold uppercase tracking-[0.1em]">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 bg-primary-600" />
          {t('notified')}
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-3 w-3 bg-line" />
          {t('awaiting')}
        </li>
      </ul>
      <p className="font-narrow text-[0.78125rem] text-ink-faint">{t('cartogramTableHint')}</p>
    </figcaption>
  );
}

/** @requirement REQ-2 State-wise self-enumeration and survey dates */
export function StatusCartogram() {
  const t = useTranslations('schedule');
  const titleId = useId();
  const descId = useId();
  const [hovered, setHovered] = useState<string>();

  // Counted from the dataset rather than written as 36, so the sentence cannot
  // contradict the map beside it if a territory is ever added or split.
  const total = ALL_SCHEDULES.length;
  const summary = t('cartogramSummary', {
    notified: NOTIFIED_COUNT,
    total,
    awaiting: total - NOTIFIED_COUNT,
  });

  return (
    <figure className="space-y-3">
      <svg
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
        viewBox={`0 0 ${COLUMNS * (TILE + GAP)} ${ROWS * (TILE + GAP)}`}
        className="h-auto w-full max-w-md"
      >
        <title id={titleId}>{t('mapTitle')}</title>
        <desc id={descId}>{summary}</desc>
        <Tiles hovered={hovered} onHover={setHovered} />
      </svg>
      <Legend summary={summary} />
    </figure>
  );
}
