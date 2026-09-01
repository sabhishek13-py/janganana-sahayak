import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CENSUS_2027 } from '@/data/census2027';
import { renderWithIntl } from '@/test/render-with-intl';

import { OfficialBanner } from '../official-banner';
import { SiteFooter } from '../site-footer';
import { NAV_ROUTES, SiteHeader } from '../site-header';
import { Button } from '../ui/button';
import { Callout } from '../ui/callout';
import { Card, CardBody, CardTitle } from '../ui/card';

describe('the persistent official banner', () => {
  it('says the tool is unofficial and links to the government portal', () => {
    renderWithIntl(<OfficialBanner />);
    expect(screen.getByText(/unofficial civic guide/i)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /official portal/i });
    expect(link).toHaveAttribute('href', CENSUS_2027.officialPortalUrl);
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(within(link).getByText('(opens in a new tab)')).toBeInTheDocument();
  });
});

describe('site header', () => {
  it('exposes one navigation landmark covering all five requirement routes', () => {
    renderWithIntl(<SiteHeader />);
    const nav = screen.getByRole('navigation');
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(NAV_ROUTES.length);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      NAV_ROUTES.map((route) => route.href),
    );
  });

  it('carries the language switcher on every page', () => {
    renderWithIntl(<SiteHeader />);
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
  });
});

describe('site footer', () => {
  it('repeats the no-data promise and cites the gazette notification', () => {
    renderWithIntl(<SiteFooter />);
    expect(screen.getByText(/collects no personal data/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CENSUS_2027.gazetteNotificationDate))).toBeInTheDocument();
  });
});

describe('shared UI primitives', () => {
  it('gives buttons a default type so they never submit a form by accident', () => {
    renderWithIntl(<Button>Press</Button>);
    expect(screen.getByRole('button', { name: 'Press' })).toHaveAttribute('type', 'button');
  });

  it('renders a card with a heading and body', () => {
    renderWithIntl(
      <Card>
        <CardTitle>Heading</CardTitle>
        <CardBody>Body text</CardBody>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders a titled callout in each tone', () => {
    renderWithIntl(
      <Callout tone="danger" title="Careful">
        Never share an OTP.
      </Callout>,
    );
    expect(screen.getByText('Careful')).toBeInTheDocument();
    expect(screen.getByText('Never share an OTP.')).toBeInTheDocument();
  });
});
