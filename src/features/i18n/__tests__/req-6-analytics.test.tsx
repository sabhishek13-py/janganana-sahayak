import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

vi.mock('@/lib/public-env', () => ({
  publicEnv: { gaMeasurementId: 'G-TESTID', mapsApiKey: undefined },
}));

const { Analytics, CONSENT_KEY, readConsent } = await import('../components/analytics');
const { ConsentBar } = await import('../components/consent-bar');

describe('analytics is off until the visitor opts in', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('reads no consent by default', () => {
    expect(readConsent()).toBe(false);
  });

  it('renders no gtag script while consent is unanswered', () => {
    const { container } = renderWithIntl(<Analytics nonce="test-nonce" />);
    expect(container.querySelector('script')).toBeNull();
  });

  it('renders no gtag script when consent is refused', async () => {
    window.localStorage.setItem(CONSENT_KEY, 'denied');
    const { container } = renderWithIntl(<Analytics nonce="test-nonce" />);
    await waitFor(() => {
      expect(container.querySelector('script')).toBeNull();
    });
  });

  it('offers a choice, and declining is as easy as accepting', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ConsentBar />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Analytics choice' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'No thanks' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'No thanks' }));
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe('denied');
    expect(screen.queryByRole('region', { name: 'Analytics choice' })).not.toBeInTheDocument();
  });

  it('records an opt-in and then stops asking', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ConsentBar />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Allow' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Allow' }));
    expect(window.localStorage.getItem(CONSENT_KEY)).toBe('granted');
    expect(readConsent()).toBe(true);
  });

  it('stays silent when the browser blocks storage entirely', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    expect(readConsent()).toBe(false);
    spy.mockRestore();
  });
});
