import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { VERDICTS } from '@/lib/ai/contracts';
import { CLAIM_FALSE, CLAIM_NOT_YET, jsonResponse } from '@/test/__fixtures__/model-replies';
import { renderWithIntl } from '@/test/render-with-intl';

import { ClaimChecker } from '../components/claim-checker';
import { CENSUS_NEVER_ASKS, LEGAL_POINTS, VERIFICATION_STEPS } from '../lib/legal';

describe('REQ-4 confidentiality explainer', () => {
  it('cites a provision for every legal guarantee', () => {
    expect(LEGAL_POINTS.length).toBeGreaterThanOrEqual(4);
    for (const point of LEGAL_POINTS) {
      expect(point.citation).toMatch(/Census (Act, 1948|Rules, 1990)|Houselisting schedule/);
      expect(point.body.length).toBeGreaterThan(40);
    }
  });

  it('states the section 15 inspection and evidence guarantee', () => {
    const point = LEGAL_POINTS.find((item) => item.id === 'not-inspectable');
    expect(point?.body).toMatch(/not open to inspection/i);
    expect(point?.body).toMatch(/not admissible as evidence/i);
    expect(point?.citation).toContain('section 15');
  });
});

describe('REQ-4 enumerator verification and scam warnings', () => {
  it('tells the reader to ask for an identity card and to refuse payment', () => {
    const ids = VERIFICATION_STEPS.map((step) => step.id);
    expect(ids).toContain('id-card');
    expect(ids).toContain('no-payment');
  });

  it('names bank details, OTPs and payments among the things never asked for', () => {
    const joined = CENSUS_NEVER_ASKS.join(' ').toLowerCase();
    expect(joined).toContain('bank account number');
    expect(joined).toContain('one-time password');
    expect(joined).toContain('payment');
  });
});

describe('REQ-4 claim checker', () => {
  it('offers exactly the four verdicts the product defines', () => {
    expect([...VERDICTS]).toEqual(['TRUE', 'FALSE', 'MISLEADING', 'NOT_YET_NOTIFIED']);
  });

  it('classifies a scam message and offers a shareable rebuttal', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(CLAIM_FALSE));
    renderWithIntl(<ClaimChecker />);

    await user.type(screen.getByLabelText('Check a claim'), 'Census officer asked for my OTP.');
    await user.click(screen.getByRole('button', { name: 'Check this claim' }));

    await waitFor(() => {
      expect(screen.getByText('False')).toBeInTheDocument();
    });
    expect(screen.getByText(CLAIM_FALSE.reason)).toBeInTheDocument();
    expect(screen.getByRole('figure')).toHaveTextContent(CLAIM_FALSE.rebuttal);
    expect(screen.getByRole('figure')).toHaveTextContent('censusindia.gov.in');
  });

  it('uses NOT_YET_NOTIFIED instead of ruling on an unnotified detail', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(CLAIM_NOT_YET));
    renderWithIntl(<ClaimChecker />);

    await user.type(screen.getByLabelText('Check a claim'), 'The caste question wording is X.');
    await user.click(screen.getByRole('button', { name: 'Check this claim' }));

    await waitFor(() => {
      expect(screen.getByText('Not yet notified')).toBeInTheDocument();
    });
  });

  it('shows an error rather than a verdict when validation fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ verdict: 'MAYBE' }));
    renderWithIntl(<ClaimChecker />);

    await user.type(screen.getByLabelText('Check a claim'), 'Some claim to check here.');
    await user.click(screen.getByRole('button', { name: 'Check this claim' }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
  });
});
