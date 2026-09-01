/**
 * Enforces the first-load JavaScript budget in CI.
 *
 * Reads the App Router build manifest, sums the gzipped size of every chunk a
 * route loads on first paint, and fails if any route exceeds the budget. This is
 * the number Next.js prints as "First Load JS".
 *
 * Usage: npm run build && npm run analyze:bundle
 */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { cwd, exit } from 'node:process';
import { gzipSync } from 'node:zlib';

const BUDGET_BYTES = 200 * 1024;
const NEXT_DIR = join(cwd(), '.next');

interface AppBuildManifest {
  readonly pages: Record<string, readonly string[]>;
}

const gzippedSize = (relativePath: string): number => {
  const absolute = join(NEXT_DIR, relativePath);
  if (!statSync(absolute, { throwIfNoEntry: false })) return 0;
  return gzipSync(readFileSync(absolute)).byteLength;
};

function readManifest(): AppBuildManifest {
  try {
    return JSON.parse(
      readFileSync(join(NEXT_DIR, 'app-build-manifest.json'), 'utf8'),
    ) as AppBuildManifest;
  } catch {
    console.error('No build manifest found. Run `npm run build` first.');
    exit(1);
  }
}

function main(): void {
  const manifest = readManifest();
  const results = Object.entries(manifest.pages)
    .map(([route, files]) => {
      const javascript = files.filter((file) => file.endsWith('.js'));
      const bytes = [...new Set(javascript)].reduce((sum, file) => sum + gzippedSize(file), 0);
      return { route, bytes };
    })
    .sort((a, b) => b.bytes - a.bytes);

  const over = results.filter((result) => result.bytes > BUDGET_BYTES);
  const kb = (bytes: number): string => `${(bytes / 1024).toFixed(1)} kB`;

  console.warn(`First-load JS budget: ${kb(BUDGET_BYTES)} gzipped per route\n`);
  for (const result of results) {
    const marker = result.bytes > BUDGET_BYTES ? 'FAIL' : 'ok  ';
    console.warn(`${marker} ${kb(result.bytes).padStart(9)}  ${result.route}`);
  }

  if (over.length > 0) {
    console.error(`\n${String(over.length)} route(s) over the first-load JS budget.`);
    exit(1);
  }
  console.warn('\nAll routes are within budget.');
}

main();
