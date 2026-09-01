import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

import { SpeakButton } from '../components/speak-button';
import { VoiceInputButton } from '../components/voice-input-button';

class UtteranceStub {
  lang = '';
  constructor(readonly text: string) {}
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('REQ-6 read aloud', () => {
  it('renders nothing when the browser cannot speak', () => {
    const { container } = renderWithIntl(<SpeakButton text="Hello" label="Read aloud" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for empty text even when speech is available', () => {
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel: vi.fn() });
    const { container } = renderWithIntl(<SpeakButton text="" label="Read aloud" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('speaks, then stops, reporting its state with aria-pressed', async () => {
    const user = userEvent.setup();
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel });
    vi.stubGlobal('SpeechSynthesisUtterance', UtteranceStub);

    renderWithIntl(<SpeakButton text="Census 2027" label="Read aloud" />);
    const button = screen.getByRole('button', { name: 'Read aloud' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    await user.click(button);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    await user.click(button);
    expect(cancel).toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('REQ-6 voice input', () => {
  it('renders nothing when the browser has no recognition engine', () => {
    const { container } = renderWithIntl(<VoiceInputButton label="Speak" onTranscript={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('starts listening and reports the transcript back', async () => {
    const user = userEvent.setup();
    const onTranscript = vi.fn();
    const emit: { current: ((event: unknown) => void) | null } = { current: null };

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
          emit.current = this.onresult;
        };
        stop = vi.fn();
      },
    );

    renderWithIntl(<VoiceInputButton label="Speak" onTranscript={onTranscript} />);
    const button = screen.getByRole('button', { name: 'Speak' });

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');

    emit.current?.({ results: [[{ transcript: 'when is the census' }]] });
    expect(onTranscript).toHaveBeenCalledWith('when is the census');

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });
});
