'use client';
// Interactive: reads the visitor's stored consent and only then loads gtag.

import Script from 'next/script';
import { useEffect, useState } from 'react';

import { publicEnv } from '@/lib/public-env';

const CONSENT_KEY = 'jgs-analytics-consent';

/**
 * Broadcast when the visitor answers the consent bar. `localStorage` fires
 * `storage` only in *other* tabs, so without this event the tab that clicked
 * "Allow" would keep analytics off until the page was reloaded.
 */
const CONSENT_EVENT = 'jgs-analytics-consent-changed';

function readConsent(): boolean {
  try {
    return globalThis.localStorage.getItem(CONSENT_KEY) === 'granted';
  } catch {
    return false;
  }
}

/** Records the choice and tells every listener in this tab about it. */
function writeConsent(value: 'granted' | 'denied'): void {
  try {
    globalThis.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // A browser with storage disabled simply keeps analytics off.
  }
  globalThis.dispatchEvent(new Event(CONSENT_EVENT));
}

/**
 * Google Analytics 4, loaded only after an explicit opt-in. IP anonymisation is
 * on, ad signals are off, and no page ever passes user text to gtag.
 *
 * The nonce is threaded down from the layout rather than derived here: these
 * tags are rendered by `next/script`, and under the app's `'strict-dynamic'`
 * policy an un-nonced script tag is rejected outright.
 */
export interface AnalyticsProps {
  readonly nonce: string;
}

export function Analytics({ nonce }: AnalyticsProps) {
  const [granted, setGranted] = useState(false);
  const measurementId = publicEnv.gaMeasurementId;

  useEffect(() => {
    const sync = () => {
      setGranted(readConsent());
    };
    sync();
    globalThis.addEventListener(CONSENT_EVENT, sync);
    // `storage` keeps a second tab in step with the one that answered.
    globalThis.addEventListener('storage', sync);
    return () => {
      globalThis.removeEventListener(CONSENT_EVENT, sync);
      globalThis.removeEventListener('storage', sync);
    };
  }, []);

  if (measurementId === undefined || !granted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${measurementId}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}

export { CONSENT_EVENT, CONSENT_KEY, readConsent, writeConsent };
