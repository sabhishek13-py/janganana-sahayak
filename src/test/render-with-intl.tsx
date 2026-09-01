import { render, type RenderResult } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';

import messages from '../../messages/en.json';

/** Renders a component inside the English message catalog, as the app does. */
export function renderWithIntl(ui: ReactElement, locale = 'en'): RenderResult {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

export { messages as enMessages };
