import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

import { DocumentChecklist } from '../components/document-checklist';

describe('REQ-3 document checklist', () => {
  it('lists what to have ready and ends by saying nothing else is needed', () => {
    renderWithIntl(<DocumentChecklist />);
    expect(
      screen.getByRole('heading', { name: /Documents worth keeping nearby/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No Aadhaar, no bank details, no property papers/)).toBeInTheDocument();
  });
});
