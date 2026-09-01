import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { isRtl, LOCALE_BCP47, LOCALE_LABELS, LOCALES, RTL_LOCALES } from '@/i18n/routing';
import { renderWithIntl } from '@/test/render-with-intl';
import { routerMock } from '@/test/router-mock';

import { LanguageSwitcher } from '../components/language-switcher';
import { speak, startVoiceInput, stopSpeaking } from '../lib/speech';

const MESSAGES_DIR = join(process.cwd(), 'messages');

const flatKeys = (value: object, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? flatKeys(child as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe('REQ-6 language coverage', () => {
  it('offers thirteen languages including Hindi, Tamil and Urdu', () => {
    expect(LOCALES.length).toBeGreaterThanOrEqual(13);
    for (const locale of ['en', 'hi', 'ta', 'ur', 'as', 'or']) {
      expect(LOCALES).toContain(locale);
    }
  });

  it('ships a catalog for every locale, with no missing or extra keys', () => {
    const files = readdirSync(MESSAGES_DIR).filter((name) => name.endsWith('.json'));
    expect(files).toHaveLength(LOCALES.length);

    const englishSource = readFileSync(join(MESSAGES_DIR, 'en.json'), 'utf8');
    const expected = flatKeys(JSON.parse(englishSource) as object).sort();

    for (const locale of LOCALES) {
      const raw = readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8');
      expect(flatKeys(JSON.parse(raw) as object).sort(), `${locale}.json`).toEqual(expected);
    }
  });

  it('translates rather than copying the English string', () => {
    const english = JSON.parse(readFileSync(join(MESSAGES_DIR, 'en.json'), 'utf8')) as {
      nav: { home: string };
    };
    for (const locale of LOCALES.filter((candidate) => candidate !== 'en')) {
      const catalog = JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as {
        nav: { home: string };
      };
      expect(catalog.nav.home, locale).not.toBe(english.nav.home);
    }
  });

  it('gives every locale a label and a BCP-47 tag for speech', () => {
    for (const locale of LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
      expect(LOCALE_BCP47[locale]).toMatch(/^[a-z]{2}-IN$/);
    }
  });

  it('marks Urdu, and only Urdu, as right-to-left', () => {
    expect([...RTL_LOCALES]).toEqual(['ur']);
    expect(isRtl('ur')).toBe(true);
    expect(isRtl('hi')).toBe(false);
  });
});

describe('REQ-6 language switcher', () => {
  it('is a labelled control listing every language in its own script', () => {
    renderWithIntl(<LanguageSwitcher />);
    const select = screen.getByLabelText('Language');
    expect(select).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(LOCALES.length);
    expect(screen.getByRole('option', { name: 'தமிழ்' })).toBeInTheDocument();
  });

  it('announces the change and navigates to the same page in the new locale', async () => {
    const user = userEvent.setup();
    renderWithIntl(<LanguageSwitcher />);
    await user.selectOptions(screen.getByLabelText('Language'), 'hi');
    expect(screen.getByText(/Language changed: हिन्दी/)).toBeInTheDocument();
    expect(routerMock.replace).toHaveBeenCalledWith('/hi/schedule');
  });
});

describe('REQ-6 speech, with graceful degradation', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'speechSynthesis');
    Reflect.deleteProperty(globalThis, 'SpeechRecognition');
  });

  it('does nothing when the browser has no speech synthesis', () => {
    expect(() => {
      speak('कुछ पाठ', 'hi');
    }).not.toThrow();
    expect(() => {
      stopSpeaking();
    }).not.toThrow();
  });

  it('speaks in the reader is own language when synthesis exists', () => {
    const speakSpy = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak: speakSpy, cancel: vi.fn() });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = '';
        constructor(readonly text: string) {}
      },
    );

    speak('ஒரு சோதனை', 'ta');
    expect(speakSpy).toHaveBeenCalledTimes(1);
    expect(speakSpy.mock.calls[0]?.[0]).toMatchObject({ lang: 'ta-IN', text: 'ஒரு சோதனை' });
  });

  it('returns undefined for voice input when no engine is present', () => {
    expect(startVoiceInput('bn', vi.fn(), vi.fn())).toBeUndefined();
  });

  it('starts recognition in the reader is language and reports the transcript', () => {
    const start = vi.fn();
    const handler: { current: ((event: unknown) => void) | null } = { current: null };
    vi.stubGlobal(
      'SpeechRecognition',
      class {
        lang = '';
        continuous = false;
        interimResults = false;
        onresult: ((event: unknown) => void) | null = null;
        onerror: (() => void) | null = null;
        onend: (() => void) | null = null;
        start = () => {
          handler.current = this.onresult;
          start();
        };
        stop = vi.fn();
      },
    );

    const onTranscript = vi.fn();
    const session = startVoiceInput('bn', onTranscript, vi.fn());
    expect(session).toBeDefined();
    expect(start).toHaveBeenCalled();

    handler.current?.({ results: [[{ transcript: 'শুমারি' }]] });
    expect(onTranscript).toHaveBeenCalledWith('শুমারি');
  });
});
