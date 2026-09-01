import { z } from 'zod';

/**
 * Browser-visible configuration only. Every value here is inlined into the
 * client bundle at build time, so nothing secret may ever be added.
 * Each entry is optional: the app degrades gracefully rather than failing.
 */
const publicEnvSchema = z.object({
  mapsApiKey: z.string().min(10).optional(),
  gaMeasurementId: z
    .string()
    .regex(/^G-[A-Z0-9]+$/, 'Expected a GA4 measurement id like G-XXXXXXX')
    .optional(),
  firebaseApiKey: z.string().min(10).optional(),
  firebaseAppId: z.string().min(5).optional(),
  firebaseProjectId: z.string().min(1).optional(),
  appCheckSiteKey: z.string().min(10).optional(),
});

const emptyToUndefined = (value: string | undefined): string | undefined =>
  value === undefined || value.trim() === '' ? undefined : value;

export const publicEnv = publicEnvSchema.parse({
  mapsApiKey: emptyToUndefined(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
  gaMeasurementId: emptyToUndefined(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
  firebaseApiKey: emptyToUndefined(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  firebaseAppId: emptyToUndefined(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  firebaseProjectId: emptyToUndefined(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  appCheckSiteKey: emptyToUndefined(process.env.NEXT_PUBLIC_APP_CHECK_SITE_KEY),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export { publicEnvSchema };
