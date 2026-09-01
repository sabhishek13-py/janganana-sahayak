'use client';
// Interactive: recomputes the remaining time on a timer in the browser.

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { DateWindow } from '@/data/census2027';

import { countdownTo, type Countdown } from '../lib/dates';

/** One minute. Announcing more often than this would flood a screen reader. */
const TICK_MS = 60_000;

export interface CountdownTimerProps {
  readonly window: DateWindow;
}

/** The rendered readout for a settled countdown. */
function CountdownReadout({ countdown }: { readonly countdown: Countdown }) {
  const t = useTranslations('schedule');
  const a11y = useTranslations('a11y');

  const label =
    countdown.phase === 'BEFORE'
      ? t('countdownTo')
      : countdown.phase === 'OPEN'
        ? t('windowOpen')
        : t('windowClosed');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={a11y('countdownRegion')}
      className="border-2 border-primary-600 bg-primary-100 p-5 text-primary-800"
    >
      <p className="meta-label !text-primary-700">{label}</p>
      {countdown.phase !== 'AFTER' && (
        <p className="mt-2.5 font-narrow text-[2rem] font-semibold tabular-nums leading-none tracking-[-0.025em] text-primary-700">
          {t('countdownValue', {
            days: countdown.days,
            hours: countdown.hours,
            minutes: countdown.minutes,
          })}
        </p>
      )}
    </div>
  );
}

export function CountdownTimer({ window: dateWindow }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<Countdown | undefined>();

  useEffect(() => {
    const update = () => {
      setCountdown(countdownTo(dateWindow, new Date()));
    };
    update();
    const timer = setInterval(update, TICK_MS);
    return () => {
      clearInterval(timer);
    };
  }, [dateWindow]);

  // Rendered only once the first tick has run, so the server-rendered markup
  // never disagrees with the client's clock.
  if (countdown === undefined) return null;
  return <CountdownReadout countdown={countdown} />;
}
