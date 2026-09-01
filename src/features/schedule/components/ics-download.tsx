'use client';
// Interactive: builds the calendar file in the browser, so no request is made.

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

import { buildScheduleIcs, icsFileName } from '../lib/ics';
import { resolveSchedule } from '../lib/schedule-lookup';

/** Downloads public census dates only: nothing identifies the person saving it. */
export function IcsDownload({ code }: { readonly code: string }) {
  const t = useTranslations('schedule');

  const download = () => {
    const schedule = resolveSchedule(code);
    if (schedule === undefined) return;
    const blob = new Blob([buildScheduleIcs(schedule, new Date())], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = icsFileName(schedule);
    // Firefox only acts on a synthetic click if the anchor is in the document,
    // and revoking the URL in the same tick cancels the download before it has
    // started in both Firefox and Safari. Append, click, then clean up after the
    // browser has had a turn.
    anchor.style.display = 'none';
    document.body.append(anchor);
    anchor.click();
    setTimeout(() => {
      anchor.remove();
      URL.revokeObjectURL(url);
    }, 0);
  };

  return <Button onClick={download}>{t('downloadIcs')}</Button>;
}
