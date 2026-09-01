import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/** Locale-aware navigation primitives. Always link with these, never a bare <a>. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
