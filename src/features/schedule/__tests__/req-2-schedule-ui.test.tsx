import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

import { CountdownTimer } from '../components/countdown-timer';
import { IcsDownload } from '../components/ics-download';
import { ScheduleFinder } from '../components/schedule-finder';
import { StatusCartogram } from '../components/status-cartogram';
import { TerritoryTable } from '../components/territory-table';
import { WindowSummary } from '../components/window-summary';
import { resolveSchedule } from '../lib/schedule-lookup';
import { territoryCodeFromName } from '../lib/territory-matching';

const goa = resolveSchedule('GA');
const bihar = resolveSchedule('BR');
const jk = resolveSchedule('JK');
if (goa === undefined || bihar === undefined || jk === undefined) {
  throw new Error('Fixtures must resolve');
}

describe('REQ-2 territory name matching', () => {
  it('matches the names Google Maps actually returns', () => {
    expect(territoryCodeFromName('Karnataka')).toBe('KA');
    expect(territoryCodeFromName('National Capital Territory of Delhi')).toBe('DL');
    expect(territoryCodeFromName('Orissa')).toBe('OR');
    expect(territoryCodeFromName('Andaman & Nicobar Islands')).toBe('AN');
    expect(territoryCodeFromName('Jammu & Kashmir')).toBe('JK');
    expect(territoryCodeFromName('  tamil   nadu  ')).toBe('TN');
  });

  it('returns undefined rather than guessing at an unknown name', () => {
    expect(territoryCodeFromName('Sindh')).toBeUndefined();
    expect(territoryCodeFromName('')).toBeUndefined();
  });
});

describe('REQ-2 window summary', () => {
  it('shows both notified windows and the reference date', () => {
    renderWithIntl(<WindowSummary schedule={goa} />);
    // Shown through the reader's locale (en-IN for English), never as raw ISO.
    expect(screen.getByText('1 April 2026 to 15 April 2026')).toBeInTheDocument();
    expect(screen.getByText('16 April 2026 to 15 May 2026')).toBeInTheDocument();
    expect(screen.getByText(/February 2027/)).toBeInTheDocument();
    expect(screen.getByText(/1 March 2027/)).toBeInTheDocument();
  });

  it('says "not yet notified" instead of showing a guessed window', () => {
    renderWithIntl(<WindowSummary schedule={bihar} />);
    expect(screen.getAllByText('Not yet notified').length).toBeGreaterThanOrEqual(2);
  });

  it('splits the two timetables for a partially snow-bound territory', () => {
    renderWithIntl(<WindowSummary schedule={jk} />);
    expect(screen.getByText(/Snow-bound, non-synchronous areas/)).toBeInTheDocument();
    expect(screen.getByText(/Rest of the territory/)).toBeInTheDocument();
    expect(screen.getByText(/September 2026/)).toBeInTheDocument();
  });
});

describe('REQ-2 countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down to a window that has not opened', () => {
    vi.setSystemTime(new Date('2026-03-30T00:00:00Z'));
    renderWithIntl(<CountdownTimer window={{ start: '2026-04-01', end: '2026-04-15' }} />);
    expect(screen.getByText('Time until self-enumeration opens')).toBeInTheDocument();
    expect(screen.getByText(/^1d/)).toBeInTheDocument();
  });

  it('says the window is open while it is open', () => {
    vi.setSystemTime(new Date('2026-04-05T00:00:00Z'));
    renderWithIntl(<CountdownTimer window={{ start: '2026-04-01', end: '2026-04-15' }} />);
    expect(screen.getByText('Self-enumeration is open now')).toBeInTheDocument();
  });

  it('says the window has closed once it is past', () => {
    vi.setSystemTime(new Date('2026-05-01T00:00:00Z'));
    renderWithIntl(<CountdownTimer window={{ start: '2026-04-01', end: '2026-04-15' }} />);
    expect(screen.getByText('This window has closed')).toBeInTheDocument();
  });
});

describe('REQ-2 schedule finder', () => {
  it('lists every State and UT in the picker', () => {
    renderWithIntl(<ScheduleFinder />);
    // 36 territories plus the "select an option" placeholder.
    expect(
      within(screen.getByLabelText(/State or Union Territory/)).getAllByRole('option'),
    ).toHaveLength(37);
  });

  it('shows the windows once a territory is chosen', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ScheduleFinder />);
    await user.selectOptions(screen.getByLabelText(/State or Union Territory/), 'GA');

    expect(screen.getByRole('heading', { name: 'Goa' })).toBeInTheDocument();
    expect(screen.getByText('16 April 2026 to 15 May 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calendar/i })).toBeInTheDocument();
  });

  it('warns, and offers no calendar export, when nothing is notified', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ScheduleFinder />);
    await user.selectOptions(screen.getByLabelText(/State or Union Territory/), 'BR');

    expect(screen.getByText('Awaiting State notification')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /calendar/i })).not.toBeInTheDocument();
  });

  it('falls back to the manual picker when geolocation is unavailable', async () => {
    const user = userEvent.setup();
    renderWithIntl(<ScheduleFinder />);
    await user.click(screen.getByRole('button', { name: 'Use my location' }));

    await waitFor(() => {
      expect(screen.getByText(/Location lookup is unavailable/)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/State or Union Territory/)).toBeInTheDocument();
  });
});

describe('REQ-2 national table', () => {
  it('renders one row per territory with a row header', () => {
    renderWithIntl(<TerritoryTable />);
    expect(screen.getByText('36 of 36')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Goa' })).toBeInTheDocument();
  });

  it('filters as the reader types', async () => {
    const user = userEvent.setup();
    renderWithIntl(<TerritoryTable />);
    await user.type(screen.getByLabelText('Search'), 'kerala');

    await waitFor(() => {
      expect(screen.getByText('1 of 36')).toBeInTheDocument();
    });
    expect(screen.queryByRole('rowheader', { name: 'Goa' })).not.toBeInTheDocument();
  });
});

describe('REQ-2 status cartogram', () => {
  it('is an accessible image with a text summary beside it', () => {
    renderWithIntl(<StatusCartogram />);
    const image = screen.getByRole('img');
    expect(image).toHaveAccessibleName('Notification status across India');
    expect(
      screen.getAllByText(/8 of 36 States and Union Territories have notified/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText(/full detail for every territory is in the table below/i),
    ).toBeInTheDocument();
  });
});

describe('REQ-2 calendar download', () => {
  it('keeps the anchor in the document and the blob URL alive until the click lands', async () => {
    const user = userEvent.setup();
    const created: string[] = [];
    const revoked: string[] = [];
    let inDocumentAtClick: boolean | undefined;
    let revokedAtClick: number | undefined;

    // jsdom implements neither, so they are stubbed rather than spied on.
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: (): string => {
        const url = `blob:test-${String(created.length)}`;
        created.push(url);
        return url;
      },
      revokeObjectURL: (url: string): void => {
        revoked.push(url);
      },
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function mockClick(this: HTMLAnchorElement) {
        // Firefox ignores a synthetic click on a detached anchor, and both
        // Firefox and Safari cancel the download if the URL is revoked first.
        inDocumentAtClick = this.isConnected;
        revokedAtClick = revoked.length;
      });

    renderWithIntl(<IcsDownload code="GA" />);
    await user.click(screen.getByRole('button', { name: /calendar/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(inDocumentAtClick).toBe(true);
    expect(revokedAtClick).toBe(0);

    await waitFor(() => {
      expect(revoked).toEqual(created);
    });
    expect(document.querySelector('a[download]')).toBeNull();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
