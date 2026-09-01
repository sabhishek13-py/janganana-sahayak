import type { Config } from 'tailwindcss';

/**
 * The Modernist design system, as specified in the Manak Mitra design handoff:
 * flat, architectural, Archivo, zero radius, strong 2px rules, flush-left, with
 * the accent ramp moved from red to blue.
 *
 * Hierarchy here comes from rules and type, never from shadows or rounding, so
 * the radius and shadow scales are deliberately emptied rather than left at
 * Tailwind's defaults — an accidental `rounded-md` should be a no-op, not a
 * quiet departure from the system.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  // The system is specified light-only. `media` dark mode would invent a second
  // palette that the handoff does not define.
  darkMode: 'class',
  theme: {
    borderRadius: { none: '0', DEFAULT: '0', sm: '0', md: '0', lg: '0', xl: '0', full: '9999px' },
    boxShadow: { none: 'none', DEFAULT: 'none', sm: 'none', md: 'none', lg: 'none' },
    extend: {
      colors: {
        /**
         * Ink. `#10162a` is also the inverted-bar background.
         *
         * `faint` and `quiet` are darkened from the reference's `#7d7979` and
         * `#9b9797`. Those two sit at 4.3:1 and 2.9:1 on white — below the
         * 4.5:1 WCAG AA threshold — and the design uses them for real text at
         * 10-12px. The reference is a jury demo on a projector; this is a
         * government service read on a phone in daylight, so the ramp is
         * shifted down the minimum needed to pass, keeping its hue and its
         * descending tonal steps.
         */
        ink: {
          DEFAULT: '#10162a',
          title: '#201e1d',
          muted: '#444141',
          subtle: '#605d5d',
          faint: '#6a6666',
          quiet: '#736f6f',
        },
        /** Accent ramp: blue, per the handoff's authoritative override. */
        primary: {
          100: '#eff4ff',
          200: '#dae5ff',
          300: '#bcd0ff',
          400: '#8aabff',
          500: '#3d7bff',
          600: '#1a56db',
          700: '#0b3fae',
          800: '#0a2f7c',
          900: '#10264d',
        },
        surface: { DEFAULT: '#ffffff', sunken: '#f2f5fb', chip: '#f8f4f4' },
        /**
         * Rules: 2px structural, 1px hairline, 1px row, 2px dashed drop target.
         *
         * The two grey tones are lifted from the reference's `#d7d3d3` and
         * `#bab6b6` for the same reason as the ink ramp: WCAG 1.4.11 wants 3:1
         * for the boundary of a control a reader has to find, and an input
         * border at 1.6:1 effectively has no edge at all in bright light.
         * `row` stays light — a table row rule is decoration, not a boundary.
         */
        line: {
          DEFAULT: '#c2bebe',
          strong: '#10162a',
          row: '#eae7e7',
          dash: '#a5a1a1',
        },
        warn: { fg: '#8a5a04', bg: '#fdf3e0', border: '#8a5a04' },
        danger: { fg: '#c0261a', bg: '#fdeceb', border: '#c0261a', pressed: '#8f1c13' },
        ok: { fg: '#17724a', bg: '#e6f4ec', border: '#17724a' },
      },
      fontFamily: {
        /** Archivo for Latin; Noto Sans carries the Indic scripts behind it. */
        sans: ['var(--font-archivo)', 'var(--font-noto)', 'system-ui', 'sans-serif'],
        /** IS-style numerals, dates and spans, per the handoff. */
        narrow: ['var(--font-archivo-narrow)', 'var(--font-noto)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // The handoff's scale, kept at the sizes actually used on these pages.
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.18em' }],
        kicker: ['0.65625rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        meta: ['0.78125rem', { lineHeight: '1.5' }],
        base: ['0.9375rem', { lineHeight: '1.55' }],
      },
      letterSpacing: { display: '-0.035em', tight: '-0.02em', button: '0.06em', label: '0.18em' },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
      borderWidth: { 3: '3px' },
    },
  },
  plugins: [],
};

export default config;
