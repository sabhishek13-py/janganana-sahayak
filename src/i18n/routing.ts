import { defineRouting } from 'next-intl/routing';

/**
 * @requirement REQ-6 Multiple Indian languages
 * Thirteen languages. `as-needed` keeps the English routes at `/schedule`
 * while other languages live under `/hi/schedule`, `/ta/schedule`, and so on.
 */
export const LOCALES = [
  'en',
  'hi',
  'bn',
  'mr',
  'te',
  'ta',
  'gu',
  'kn',
  'ml',
  'or',
  'pa',
  'as',
  'ur',
] as const;

export type Locale = (typeof LOCALES)[number];

/** Locales written right-to-left; drives the `dir` attribute on <html>. */
export const RTL_LOCALES: readonly Locale[] = ['ur'];

export const LOCALE_LABELS: Readonly<Record<Locale, string>> = {
  en: 'English',
  hi: 'हिन्दी',
  bn: 'বাংলা',
  mr: 'मराठी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  gu: 'ગુજરાતી',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  or: 'ଓଡ଼ିଆ',
  pa: 'ਪੰਜਾਬੀ',
  as: 'অসমীয়া',
  ur: 'اردو',
};

/** BCP-47 tags used for text-to-speech and Indic voice input. */
export const LOCALE_BCP47: Readonly<Record<Locale, string>> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  or: 'or-IN',
  pa: 'pa-IN',
  as: 'as-IN',
  ur: 'ur-IN',
};

export const isRtl = (locale: Locale): boolean => RTL_LOCALES.includes(locale);

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: true,
});
