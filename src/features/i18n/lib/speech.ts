import { LOCALE_BCP47, type Locale } from '@/i18n/routing';

/** Minimal shape of the Web Speech recognition API, which has no standard TS type. */
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechWindow {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
}

export const isSpeechSynthesisAvailable = (): boolean =>
  typeof globalThis.speechSynthesis !== 'undefined';

export function speechRecognitionConstructor(): RecognitionConstructor | undefined {
  const candidate = globalThis as unknown as SpeechWindow;
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition;
}

export const isVoiceInputAvailable = (): boolean => speechRecognitionConstructor() !== undefined;

/**
 * @requirement REQ-6 Multiple Indian languages
 * Reads text aloud in the reader's language. Silently does nothing where the
 * browser has no speech synthesis, so no caller needs to branch.
 */
export function speak(text: string, locale: Locale): void {
  if (!isSpeechSynthesisAvailable() || text === '') return;
  globalThis.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LOCALE_BCP47[locale];
  globalThis.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisAvailable()) globalThis.speechSynthesis.cancel();
}

export interface VoiceSession {
  readonly stop: () => void;
}

/**
 * Starts Indic voice input in the reader's language. Returns undefined when the
 * browser has no recognition engine, so the caller keeps the typed input.
 */
export function startVoiceInput(
  locale: Locale,
  onTranscript: (transcript: string) => void,
  onEnd: () => void,
): VoiceSession | undefined {
  const Recognition = speechRecognitionConstructor();
  if (Recognition === undefined) return undefined;

  const recognition = new Recognition();
  recognition.lang = LOCALE_BCP47[locale];
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript !== undefined) onTranscript(transcript);
  };
  recognition.onerror = onEnd;
  recognition.onend = onEnd;
  recognition.start();
  return {
    stop: () => {
      recognition.stop();
    },
  };
}
