import 'server-only';

import { z } from 'zod';

/**
 * Server-side environment. Importing this from a Client Component is a build
 * error (`server-only`), so a secret cannot reach the browser by accident.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Groq key. Absent is allowed — AI routes then answer 503 instead of crashing the app. */
  GROQ_API_KEY: z
    .string()
    .min(20, 'GROQ_API_KEY looks too short to be a real key')
    .regex(/^gsk_[A-Za-z0-9]+$/, 'GROQ_API_KEY should look like gsk_...')
    .optional(),
  /**
   * Must be a model that supports strict structured outputs, since every route
   * constrains its reply with a JSON Schema. See `docs` in the README.
   */
  GROQ_MODEL: z.string().min(1).default('openai/gpt-oss-20b'),
  /**
   * Firebase project number, used to verify App Check tokens. This is the
   * all-digits number from the Firebase console, not the project *id*.
   */
  FIREBASE_PROJECT_NUMBER: z
    .string()
    .regex(/^\d+$/, 'FIREBASE_PROJECT_NUMBER must be the all-digits project number, not the id')
    .optional(),
  APP_CHECK_ENFORCED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  RATE_LIMIT_CAPACITY: z.coerce.number().int().positive().max(1000).default(10),
  RATE_LIMIT_REFILL_PER_MINUTE: z.coerce.number().int().positive().max(1000).default(5),
});

/** Names that must never be exposed to the browser, whatever the deployer typed. */
const FORBIDDEN_PUBLIC_KEYS = [
  'NEXT_PUBLIC_GROQ_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_SERVICE_ACCOUNT',
] as const;

/**
 * Names that are public *by design*, and so must not trip the heuristic below.
 *
 * A Firebase web API key and a browser Maps key are client identifiers, not
 * credentials: they are meant to ship in the bundle, and are protected by HTTP
 * referrer restrictions and App Check rather than by being kept secret. The
 * pattern below matches `API_KEY`, which would otherwise refuse to boot a
 * correctly configured deployment.
 */
const PUBLIC_BY_DESIGN: ReadonlySet<string> = new Set([
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
]);

const SECRET_SHAPED = /(SECRET|PRIVATE_KEY|SERVICE_ACCOUNT|API_KEY)/;

/** Any environment-shaped record, so callers can pass a partial map in tests. */
export type EnvSource = Readonly<Record<string, string | undefined>>;

/** Refuses to boot if a secret has been given a browser-visible `NEXT_PUBLIC_` name. */
export function assertNoPublicSecrets(source: EnvSource = process.env): void {
  const leaked = Object.keys(source).filter(
    (key) =>
      key.startsWith('NEXT_PUBLIC_') &&
      !PUBLIC_BY_DESIGN.has(key) &&
      (FORBIDDEN_PUBLIC_KEYS.some((forbidden) => forbidden === key) || SECRET_SHAPED.test(key)),
  );
  if (leaked.length > 0) {
    throw new Error(
      `Refusing to start: secret-shaped variables are exposed to the browser: ${leaked.join(', ')}`,
    );
  }
}

/**
 * Treats a variable set to an empty string as absent.
 *
 * Every optional value here means "this feature is off when unset", but Zod's
 * `.optional()` admits `undefined` and not `''`. Hosting dashboards hand you an
 * empty string whenever a variable is added and left blank, so without this a
 * deployer who creates the row but has nothing to put in it yet gets a refusal
 * to boot rather than the feature simply staying off. `public-env.ts` has always
 * done this; the server schema should agree.
 */
function withoutBlanks(source: EnvSource): EnvSource {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value === undefined || value.trim() !== ''),
  );
}

function readServerEnv(source: EnvSource = process.env): z.infer<typeof serverEnvSchema> {
  assertNoPublicSecrets(source);
  const parsed = serverEnvSchema.safeParse(withoutBlanks(source));
  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Refusing to start: invalid server environment. ${detail}`);
  }
  return parsed.data;
}

export const serverEnv = readServerEnv();

export const isAiConfigured = (): boolean => serverEnv.GROQ_API_KEY !== undefined;

export { readServerEnv, serverEnvSchema };
