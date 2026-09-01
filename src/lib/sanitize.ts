const HTML_TAG = /<\/?[a-z][^>]*>/gi;
/**
 * Control characters, *excluding* tab (U+0009) and newline (U+000A): those two
 * carry the paragraph and list structure of a model answer, and stripping them
 * collapses every reply into a single run-on line.
 */
// eslint-disable-next-line no-control-regex -- stripping control characters is the point of this module
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;
/** Zero-width, bidi-override and other invisible characters: the usual text-spoofing vehicles. */
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g;

export const MAX_RENDERED_AI_CHARS = 4_000;

/**
 * Defence in depth for model output. Nothing is ever passed to
 * `dangerouslySetInnerHTML`, so React already escapes it; this additionally
 * removes markup, control and invisible characters before the string is shown.
 */
export function sanitizeModelText(input: string, maxChars = MAX_RENDERED_AI_CHARS): string {
  const stripped = input
    .replace(HTML_TAG, ' ')
    .replace(CONTROL_CHARS, '')
    .replace(INVISIBLE, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return stripped.length > maxChars ? `${stripped.slice(0, maxChars).trimEnd()}\u2026` : stripped;
}

/** Normalises untrusted user input before it is placed inside a delimited prompt block. */
export function sanitizeUserInput(input: string, maxChars = 2_000): string {
  return input
    .replace(CONTROL_CHARS, '')
    .replace(INVISIBLE, '')
    .replace(/`{3,}/g, '``')
    .trim()
    .slice(0, maxChars);
}
