/**
 * Build-time translation pipeline.
 *
 * Translates `messages/en.json` into every other locale with the Google Cloud
 * Translation API and writes the result to `messages/<locale>.json`. Translation
 * happens here, at build time, and never at runtime: the committed catalogs are
 * what ships, so a visitor's request never waits on a translation call.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./sa.json npm run translate
 *   npm run translate -- --locales hi,ta --check
 *
 * Existing translations are preserved unless --force is passed, so reviewed
 * wording is never silently overwritten by a machine translation.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { argv, cwd, env, exit } from 'node:process';

import { v2 } from '@google-cloud/translate';

import { LOCALES } from '../src/i18n/routing';

const MESSAGES_DIR = join(cwd(), 'messages');
const SOURCE_LOCALE = 'en';

type Catalog = Record<string, Record<string, string>>;

const readCatalog = (locale: string): Catalog =>
  JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as Catalog;

const writeCatalog = (locale: string, catalog: Catalog): void => {
  writeFileSync(join(MESSAGES_DIR, `${locale}.json`), `${JSON.stringify(catalog, null, 2)}\n`);
};

function flatten(catalog: Catalog): { keys: string[]; values: string[] } {
  const keys: string[] = [];
  const values: string[] = [];
  for (const [namespace, entries] of Object.entries(catalog)) {
    for (const [key, value] of Object.entries(entries)) {
      keys.push(`${namespace}.${key}`);
      values.push(value);
    }
  }
  return { keys, values };
}

function unflatten(keys: readonly string[], values: readonly string[]): Catalog {
  const catalog: Catalog = {};
  keys.forEach((path, index) => {
    const [namespace, key] = path.split('.');
    const value = values[index];
    if (namespace === undefined || key === undefined || value === undefined) return;
    catalog[namespace] ??= {};
    catalog[namespace][key] = value;
  });
  return catalog;
}

interface Options {
  readonly locales: readonly string[];
  readonly force: boolean;
  readonly check: boolean;
}

function parseOptions(): Options {
  const requested = argv[argv.indexOf('--locales') + 1];
  const locales =
    argv.includes('--locales') && requested !== undefined
      ? requested.split(',')
      : LOCALES.filter((locale) => locale !== SOURCE_LOCALE);
  return { locales, force: argv.includes('--force'), check: argv.includes('--check') };
}

/** Verifies every catalog has exactly the source keys. Used by CI. */
function checkParity(source: Catalog, locales: readonly string[]): number {
  const expected = flatten(source).keys.sort();
  let failures = 0;
  for (const locale of locales) {
    const actual = flatten(readCatalog(locale)).keys.sort();
    const missing = expected.filter((key) => !actual.includes(key));
    const extra = actual.filter((key) => !expected.includes(key));
    if (missing.length > 0 || extra.length > 0) {
      failures += 1;
      console.error(`${locale}: missing ${missing.join(', ')} extra ${extra.join(', ')}`);
    }
  }
  return failures;
}

async function translateLocale(
  client: v2.Translate,
  source: Catalog,
  locale: string,
  force: boolean,
): Promise<void> {
  const { keys, values } = flatten(source);
  const existing = force ? {} : readCatalog(locale);
  const existingFlat = flatten(existing);

  // A key needs translating when the catalog has no entry for it, or when the
  // entry is still verbatim English. The second case is how a newly added string
  // gets filled in: a key is seeded across every catalog with the source text so
  // the app never renders a missing-message error, and this pass replaces it.
  const needed = keys.filter((key) => {
    const index = existingFlat.keys.indexOf(key);
    if (index === -1) return true;
    const current = existingFlat.values[index];
    return current === undefined || current === values[keys.indexOf(key)];
  });
  if (needed.length === 0) {
    console.warn(`${locale}: already complete, nothing to translate`);
    return;
  }

  const toTranslate = needed.map((key) => values[keys.indexOf(key)] ?? '');
  const [translations] = await client.translate(toTranslate, { from: SOURCE_LOCALE, to: locale });
  const translated = Array.isArray(translations) ? translations : [translations];

  // Merge per namespace. A top-level `Object.assign` would replace whole
  // namespace objects with the handful of keys just translated, silently
  // deleting every reviewed string in them.
  const merged: Catalog = {};
  for (const [namespace, entries] of Object.entries(existing)) merged[namespace] = { ...entries };
  for (const [namespace, entries] of Object.entries(unflatten(needed, translated))) {
    merged[namespace] = { ...merged[namespace], ...entries };
  }
  writeCatalog(locale, merged);
  console.warn(`${locale}: translated ${String(needed.length)} strings`);
}

async function main(): Promise<void> {
  const options = parseOptions();
  const source = readCatalog(SOURCE_LOCALE);

  if (options.check) {
    const failures = checkParity(source, options.locales);
    if (failures > 0) exit(1);
    console.warn(`All ${String(options.locales.length)} catalogs match ${SOURCE_LOCALE}.json`);
    return;
  }

  if (
    env.GOOGLE_APPLICATION_CREDENTIALS === undefined &&
    env.GOOGLE_TRANSLATE_API_KEY === undefined
  ) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_TRANSLATE_API_KEY to translate.');
    exit(1);
  }

  const client = new v2.Translate(
    env.GOOGLE_TRANSLATE_API_KEY === undefined ? {} : { key: env.GOOGLE_TRANSLATE_API_KEY },
  );
  for (const locale of options.locales) {
    await translateLocale(client, source, locale, options.force);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  exit(1);
});
