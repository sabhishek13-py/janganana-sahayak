'use client';

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getToken, initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

import { publicEnv } from './public-env';

let app: FirebaseApp | undefined;
let appCheck: ReturnType<typeof initializeAppCheck> | undefined;

/**
 * Initialises Firebase App Check so that only attested instances of this app can
 * spend model quota. Every value here is a public client identifier; the secret
 * that verifies these tokens never leaves the server.
 */
function ensureAppCheck(): ReturnType<typeof initializeAppCheck> | undefined {
  const { firebaseApiKey, firebaseAppId, firebaseProjectId, appCheckSiteKey } = publicEnv;
  if (
    firebaseApiKey === undefined ||
    firebaseAppId === undefined ||
    firebaseProjectId === undefined ||
    appCheckSiteKey === undefined
  ) {
    return undefined;
  }

  app ??= initializeApp({
    apiKey: firebaseApiKey,
    appId: firebaseAppId,
    projectId: firebaseProjectId,
    authDomain: `${firebaseProjectId}.firebaseapp.com`,
  });
  appCheck ??= initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  return appCheck;
}

/**
 * Headers to attach to an AI request. Returns an empty object when App Check is
 * not configured, so a deployment without Firebase still works.
 */
export async function appCheckHeaders(): Promise<Record<string, string>> {
  try {
    const instance = ensureAppCheck();
    if (instance === undefined) return {};
    const { token } = await getToken(instance, false);
    return { 'x-firebase-appcheck': token };
  } catch {
    // An attestation failure must not stop the visitor from asking a question;
    // the server decides whether to enforce App Check.
    return {};
  }
}

/** Test seam: forgets the memoised app so a new configuration is picked up. */
export function resetFirebaseForTests(): void {
  app = undefined;
  appCheck = undefined;
}
