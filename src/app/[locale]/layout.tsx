import type { Metadata } from 'next';
import { Archivo, Archivo_Narrow, Noto_Sans } from 'next/font/google';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { OfficialBanner } from '@/components/official-banner';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Analytics } from '@/features/i18n/components/analytics';
import { ConsentBar } from '@/features/i18n/components/consent-bar';
import { isRtl, routing } from '@/i18n/routing';
import { enableStaticRendering } from '@/i18n/static-locale';

import '../globals.css';

/*
  Google Fonts, self-hosted at build time by next/font: no runtime request to
  Google, and nothing for the CSP to allow.

  Archivo is the Modernist system's face and carries the Latin text. It has no
  Indic coverage at all, so Noto Sans sits behind it in the stack for the twelve
  other languages — Devanagari is subsetted here because Hindi and Marathi are
  the largest of them; the remaining scripts fall back to the system's own Noto
  faces, which every current mobile and desktop OS ships.
*/
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
  variable: '--font-archivo',
});

/** Used for IS-style numerals, dates and spans, per the design handoff. */
const archivoNarrow = Archivo_Narrow({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-archivo-narrow',
});

const notoSans = Noto_Sans({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--font-noto',
});

const fontVariables = `${archivo.variable} ${archivoNarrow.variable} ${notoSans.variable}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app' });
  return {
    title: { default: `${t('name')} - ${t('tagline')}`, template: `%s - ${t('name')}` },
    description: t('tagline'),
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  enableStaticRendering(locale);

  /*
    Reading a header opts this segment into dynamic rendering, and that is
    deliberate. The Content-Security-Policy is nonce-based, and a nonce is only
    worth anything if it is fresh per request: prerendering these pages would
    bake one nonce into the HTML at build time while middleware kept issuing new
    ones, so `'strict-dynamic'` would reject every script the app ships. Static
    rendering is the thing being traded away here, not something being missed.
  */
  const nonce = (await headers()).get('x-nonce') ?? '';
  const t = await getTranslations({ locale, namespace: 'app' });

  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'} className={fontVariables}>
      <body className="flex min-h-screen flex-col font-sans">
        <NextIntlClientProvider>
          <a href="#main" className="skip-link">
            {t('skipToContent')}
          </a>
          <OfficialBanner />
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
            {children}
          </main>
          <SiteFooter />
          <ConsentBar />
          <Analytics nonce={nonce} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
