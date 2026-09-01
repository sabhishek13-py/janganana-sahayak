import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { currentPathname, routerMock } from './src/test/router-mock';

// The App Router has no provider in jsdom; next-intl's navigation sits on top of it.
vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
  usePathname: () => currentPathname,
  useParams: () => ({ locale: 'en' }),
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegment: () => null,
  useSelectedLayoutSegments: () => [],
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  notFound: vi.fn(),
  RedirectType: { push: 'push', replace: 'replace' },
}));

afterEach(() => {
  cleanup();
});

// jsdom implements neither of these; chart and dialog components query them.
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

/**
 * Node 26 defines an experimental global `localStorage` that shadows jsdom's and
 * resolves to undefined without `--localstorage-file`. Tests need a working one,
 * so a Map-backed Storage is installed when the environment has none.
 */
const installedStorage: unknown = Reflect.get(window, 'localStorage');
if (installedStorage === undefined) {
  const entries = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
}

globalThis.ResizeObserver = class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
};

// jsdom reports every element as 0x0, which makes Recharts refuse to draw and warn.
for (const dimension of ['offsetWidth', 'offsetHeight'] as const) {
  Object.defineProperty(HTMLElement.prototype, dimension, {
    configurable: true,
    value: dimension === 'offsetWidth' ? 800 : 400,
  });
}
