import { vi } from 'vitest';

/** Shared App Router spies, so tests can assert on navigation. */
export const routerMock = {
  replace: vi.fn(),
  push: vi.fn(),
  prefetch: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
};

export let currentPathname = '/schedule';

export function setPathname(pathname: string): void {
  currentPathname = pathname;
}
