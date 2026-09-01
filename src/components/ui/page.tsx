import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * The page-level furniture of the Modernist system.
 *
 * Regions are separated by 2px rules and uppercase tracked labels rather than
 * by cards, spacing or shadows, so these components exist to keep that rule in
 * one place instead of restated at every call site.
 */

export interface PageHeaderProps {
  readonly title: string;
  readonly lead?: string;
  /** Set flush right in the narrow face — a count, a status, a source note. */
  readonly aside?: ReactNode;
}

/** A page opens with its title over a 2px rule, flush left. */
export function PageHeader({ title, lead, aside }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end gap-x-5 gap-y-3 border-b-2 border-line-strong pb-4">
      <div className="min-w-0 flex-1">
        <h1>{title}</h1>
        {lead !== undefined && (
          <p className="mt-2.5 max-w-[62ch] text-[0.90625rem] leading-[1.6] text-ink-subtle">
            {lead}
          </p>
        )}
      </div>
      {aside !== undefined && (
        <p className="font-narrow text-[0.78125rem] text-ink-faint">{aside}</p>
      )}
    </header>
  );
}

export interface SectionProps {
  /** The uppercase label on the rule. Also names the section for assistive tech. */
  readonly label: string;
  readonly aside?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  /** Rendered as the accessible name; defaults to `label`. */
  readonly headingId?: string;
}

/**
 * A titled region. The label is a real heading — it looks like a small caption,
 * but it is what a screen-reader user navigates the page by, so it must not be
 * demoted to a styled `<span>`.
 */
export function Section({ label, aside, children, className, headingId }: SectionProps) {
  const id = headingId ?? `section-${label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`;
  return (
    <section aria-labelledby={id} className={cn('space-y-5', className)}>
      <div className="section-label">
        <h2 id={id} className="text-label font-extrabold uppercase tracking-label">
          {label}
        </h2>
        {aside !== undefined && (
          <span className="ml-auto font-narrow text-[0.78125rem] font-normal normal-case tracking-normal text-ink-faint">
            {aside}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * A band of cells divided by rules rather than gaps — the system's way of
 * setting facts side by side.
 *
 * The reference design is built for a 1440px projector and leaves its columns
 * uncollapsed. This is a public service used mostly on phones, so the band
 * stacks below `sm` and the dividing rule moves from the left edge to the top,
 * keeping the "separated by a rule, never by a gap" reading at every width.
 */
export function StatBand({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 border-y-2 border-line-strong sm:grid-cols-3',
        '[&>div:first-child]:border-t-0 [&>div]:border-t [&>div]:border-line [&>div]:px-0 [&>div]:py-5',
        'sm:[&>div:first-child]:border-l-0 sm:[&>div:first-child]:pl-0 sm:[&>div]:border-l sm:[&>div]:border-t-0 sm:[&>div]:px-7',
        className,
      )}
    >
      {children}
    </dl>
  );
}

export interface StatProps {
  readonly label: string;
  readonly value: string;
  readonly caption?: string;
  /** Sets the value in the accent, for the one figure that carries the point. */
  readonly accent?: boolean;
}

/** One cell of a `StatBand`: a small tracked label over a large tight numeral. */
export function Stat({ label, value, caption, accent = false }: StatProps) {
  return (
    <div>
      <dt className="meta-label">{label}</dt>
      <dd>
        <span
          className={cn(
            'mt-2 block text-[1.75rem] font-extrabold leading-none tracking-[-0.025em] sm:text-[2rem]',
            accent ? 'text-primary-600' : 'text-ink',
          )}
        >
          {value}
        </span>
        {caption !== undefined && (
          <span className="mt-2.5 block max-w-[40ch] text-[0.78125rem] leading-[1.55] text-ink-subtle">
            {caption}
          </span>
        )}
      </dd>
    </div>
  );
}

/**
 * A horizontal proportion bar: an empty accent-tinted track with a solid fill.
 * Decorative — every caller states the same number in text beside it.
 */
export function MeterBar({ ratio, className }: { ratio: number; className?: string }) {
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <span aria-hidden="true" className={cn('block h-1.5 w-full bg-primary-100', className)}>
      <span
        className="block h-full bg-primary-600 transition-[width] duration-300"
        style={{ width: `${String(clamped * 100)}%` }}
      />
    </span>
  );
}
