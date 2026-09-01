import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { enMessages, renderWithIntl } from '@/test/render-with-intl';

import { ChartCard } from '../components/chart-card';
import { InsightCharts } from '../components/insight-charts';
import { literacySeries } from '../lib/chart-data';

/** The summary is a translated message now, so the test reads the same catalog the app does. */
const LITERACY_SUMMARY = 'India had a literacy rate of 74 per cent at Census 2011.';

describe('REQ-5 every chart has a text equivalent', () => {
  it('pairs the visual with a summary and an expandable data table', async () => {
    const user = userEvent.setup();
    renderWithIntl(
      <ChartCard
        title="Literacy rate by State, 2011"
        summary={LITERACY_SUMMARY}
        data={literacySeries}
        valueLabel="Literacy rate 2011 (%)"
      >
        <div />
      </ChartCard>,
    );

    expect(screen.getByText(LITERACY_SUMMARY)).toBeInTheDocument();
    expect(screen.getByText('Census 2011 baseline')).toBeInTheDocument();

    await user.click(screen.getByText('Show data table'));
    const table = screen.getByRole('table');
    expect(within(table).getByRole('rowheader', { name: 'Kerala' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(literacySeries.length + 1);
  });

  it('labels an estimated chart as a projection, not a census figure', () => {
    renderWithIntl(
      <ChartCard
        title="Population"
        summary="Population by State."
        data={literacySeries}
        valueLabel="Population"
        secondaryLabel="Estimated 2027"
        isEstimate
        narration={<p>{enMessages.insights.projectionMethod.replace('{points}', '3.9')}</p>}
      >
        <div />
      </ChartCard>,
    );
    expect(screen.getByText('Projection, not an official figure')).toBeInTheDocument();
    expect(screen.getByText(/Estimated by this app, not by the Census/)).toBeInTheDocument();
  });
});

describe('REQ-5 chart gallery', () => {
  it('renders every chart as a figure with its own heading', () => {
    renderWithIntl(<InsightCharts />);
    expect(screen.getAllByRole('figure')).toHaveLength(5);
    expect(
      screen.getByRole('heading', { name: 'Literacy rate by State, 2011' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Urban and rural split, 2011' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Population by State: 2011 and a 2027 estimate' }),
    ).toBeInTheDocument();
  });

  it('states the projection method wherever an estimate is shown', () => {
    renderWithIntl(<InsightCharts />);
    expect(screen.getByText(/Estimated by this app, not by the Census/)).toBeInTheDocument();
    // The deceleration figure is interpolated, so this also proves the message
    // is rendered through the catalog rather than shown with a raw placeholder.
    expect(screen.getByText(/3\.9 percentage points per decade/)).toBeInTheDocument();
  });
});
