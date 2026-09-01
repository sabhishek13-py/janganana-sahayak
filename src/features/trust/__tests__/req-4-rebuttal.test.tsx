import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CENSUS_2027 } from '@/data/census2027';
import { CLAIM_FALSE } from '@/test/__fixtures__/model-replies';
import { renderWithIntl } from '@/test/render-with-intl';

import { RebuttalCard } from '../components/rebuttal-card';

describe('REQ-4 shareable rebuttal card', () => {
  it('shows the rebuttal with the official portal appended', () => {
    renderWithIntl(<RebuttalCard verdict={CLAIM_FALSE} />);
    const card = screen.getByRole('figure');
    expect(card).toHaveTextContent(CLAIM_FALSE.rebuttal);
    expect(card).toHaveTextContent(CENSUS_2027.officialPortalUrl);
  });

  it('copies the text and confirms it', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderWithIntl(<RebuttalCard verdict={CLAIM_FALSE} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(CLAIM_FALSE.rebuttal));
    expect(await screen.findByText('Copied')).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it('stays quiet when the clipboard is unavailable', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    renderWithIntl(<RebuttalCard verdict={CLAIM_FALSE} />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));

    expect(screen.queryByText('Copied')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
