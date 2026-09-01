import { TERRITORIES } from '@/data/census2027';

const normalise = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll('&', 'and')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Names Google Maps returns that differ from the names used in the dataset.
 *
 * Written the way Maps writes them and normalised below, so an entry cannot go
 * stale against `normalise`. Spelling one of these keys in already-normalised
 * form is how three of them ("jammu & kashmir" and friends) were previously
 * unreachable: lookup happens on the normalised name, in which `&` is `and`.
 */
const RAW_ALIASES: Readonly<Record<string, string>> = {
  'National Capital Territory of Delhi': 'DL',
  'NCT of Delhi': 'DL',
  Delhi: 'DL',
  'New Delhi': 'DL',
  Orissa: 'OR',
  Pondicherry: 'PY',
  Uttaranchal: 'UT',
  'Jammu & Kashmir': 'JK',
  'Andaman & Nicobar Islands': 'AN',
  'Dadra & Nagar Haveli and Daman & Diu': 'DH',
  'Dadra and Nagar Haveli': 'DH',
  'Daman and Diu': 'DH',
};

const ALIASES: ReadonlyMap<string, string> = new Map(
  Object.entries(RAW_ALIASES).map(([name, code]) => [normalise(name), code]),
);

const BY_NORMALISED_NAME: ReadonlyMap<string, string> = new Map(
  TERRITORIES.map((territory) => [normalise(territory.name), territory.code]),
);

/**
 * Resolves an administrative area name to a State/UT code. Returns undefined
 * rather than guessing, so the UI can fall back to the manual picker.
 */
export function territoryCodeFromName(name: string): string | undefined {
  const key = normalise(name);
  const alias = ALIASES.get(key);
  if (alias !== undefined) return alias;
  const direct = BY_NORMALISED_NAME.get(key);
  if (direct !== undefined) return direct;
  // "Delhi (NCT)" in the dataset normalises to "delhi nct"; match on a shared prefix.
  for (const [candidate, code] of BY_NORMALISED_NAME) {
    if (candidate.startsWith(`${key} `) || key.startsWith(`${candidate} `)) return code;
  }
  return undefined;
}
