import { setRequestLocale } from 'next-intl/server';

/**
 * Opts a page into static rendering for the current locale.
 *
 * next-intl 4 marks `setRequestLocale` deprecated in favour of `next/root-params`,
 * which needs Next.js 16. On Next.js 15 this is still the supported way to keep
 * localised pages statically renderable, so the deprecation is suppressed here,
 * once, rather than at every call site.
 */
export function enableStaticRendering(locale: string): void {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above
  setRequestLocale(locale);
}
