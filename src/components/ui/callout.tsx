import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * The status vocabulary sits outside the mono ramp, because "current",
 * "amended" and "superseded" have to be distinguishable at a glance. Each tone
 * is a 2px border on its own tint, flat and square like everything else.
 */
const TONES = {
  info: 'border-primary-600 bg-primary-100 text-primary-800',
  warn: 'border-warn-border bg-warn-bg text-warn-fg',
  danger: 'border-danger-border bg-danger-bg text-danger-fg',
  ok: 'border-ok-border bg-ok-bg text-ok-fg',
} as const;

export interface CalloutProps {
  readonly tone?: keyof typeof TONES;
  readonly title?: string;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Callout({ tone = 'info', title, children, className }: CalloutProps) {
  return (
    <div className={cn('border-2 p-4', TONES[tone], className)}>
      {title !== undefined && (
        <p className="mb-1.5 text-[1.0625rem] font-extrabold tracking-tight">{title}</p>
      )}
      <div className="text-meta leading-[1.6]">{children}</div>
    </div>
  );
}

/** A small square status chip, as used beside a standard or a territory row. */
export function StatusChip({
  tone = 'info',
  children,
  className,
}: {
  readonly tone?: keyof typeof TONES;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center border px-2 py-1 text-[0.6875rem] font-extrabold uppercase tracking-[0.1em]',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
