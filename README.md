# JanGanana Sahayak

A civic companion that helps residents of India understand and prepare for
**Census 2027** — what will be asked, when their State's window opens, what the
law protects, and how to tell a genuine enumerator from a scam.

Thirteen languages. No account, no tracking by default, and nothing you type is
ever stored.

> **This is an unofficial guide.** Real self-enumeration happens only on the
> Government of India census portal. Every page says so.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then add a Groq key, see below
npm run dev                    # http://localhost:3000
```

The app runs **without** an API key — the schedule, phases, trust and insights
pages are built from a frozen dataset and need no model. Only the four
assistant features degrade, and they degrade honestly: a `503` and a plain
"not configured" message rather than a spinner that never resolves.

---

## Configuration

Everything is optional. Each absent value disables one feature rather than
breaking the app.

| Variable                                                   | Purpose                                 | Absent means                 |
| ---------------------------------------------------------- | --------------------------------------- | ---------------------------- |
| `GROQ_API_KEY`                                             | The assistant features                  | AI routes answer `503`       |
| `GROQ_MODEL`                                               | Model id (default `openai/gpt-oss-20b`) | uses the default             |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`                          | "Use my location" shortcut              | manual picker only           |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`                            | Opt-in analytics                        | no analytics, no consent bar |
| `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_APP_CHECK_SITE_KEY` | App Check attestation                   | attestation skipped          |
| `APP_CHECK_ENFORCED`, `FIREBASE_PROJECT_NUMBER`            | Enforce App Check server-side           | verification skipped         |
| `RATE_LIMIT_CAPACITY`, `RATE_LIMIT_REFILL_PER_MINUTE`      | Token bucket per client                 | 10 burst, 5/min              |
| `TRUSTED_PROXY_HOPS`                                       | Proxies that append `x-forwarded-for`   | 1                            |

Get a Groq key at [console.groq.com/keys](https://console.groq.com/keys).

> `GROQ_MODEL` **must support strict structured outputs.** Three routes constrain
> the reply with a JSON Schema, and a model without that support will fail every
> request. As of writing that means `openai/gpt-oss-20b`, `openai/gpt-oss-120b`
> or `qwen/qwen3.8-27b` — check Groq's docs before changing it.

The environment is parsed and validated at boot (`src/lib/env.ts`). A malformed
key fails loudly at startup rather than on the first request, and any
secret-shaped variable given a browser-visible `NEXT_PUBLIC_` name refuses to
start at all.

---

## What it does

| Route          | Feature                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| `/phases`      | What each of the two census phases collects, why, and what it never asks            |
| `/schedule`    | Your State/UT windows, a live countdown, a status cartogram, calendar export        |
| `/walkthrough` | A rehearsal of the 33 houselisting questions that submits nothing                   |
| `/trust`       | Statutory confidentiality guarantees, how to verify an enumerator, a rumour checker |
| `/insights`    | Census 2011 baselines as charts, each with a text equivalent                        |

### The assistant

Four model-backed features, all grounded in the frozen dataset:

- **Explain this simply** (`/api/explain`) — streams a plain-language gloss of one
  houselisting question. Only the question _number_ is sent, so no visitor text
  ever reaches the model.
- **Ask about the census** (`/api/ask`) — answers from the grounding data, or says
  the detail is not yet notified.
- **Rumour checker** (`/api/claim-check`) — classifies a forwarded message and
  drafts a shareable rebuttal.
- **Query the data** (`/api/insights-query`) — answers about 2011 baselines and
  names the chart that shows it.

---

## Design notes

A few decisions worth knowing before changing things.

**Dates are ISO in the data, localised in the UI.** `2026-04-01` sorts and
compares correctly, but no reader should see it. `useFormattedWindow` renders
through the active locale. Day boundaries are anchored to **IST**, not UTC —
census windows are Indian civil dates, and a UTC boundary would flip them at
05:30 local.

**Nothing is stored.** Practice answers live in React state and nowhere else: no
`localStorage`, no cookie, no network. This is asserted by a test, not just
intended.

**Untrusted text is fenced, not trusted.** Anything a visitor types is sanitised
and wrapped in delimiters the system prompt tells the model to treat as data.
Model output is sanitised again before render.

**Model replies are validated twice.** Structured routes constrain generation
with a JSON Schema _and_ parse the reply with Zod. The Zod pass is not
redundant — it is the check that survives a provider change or a schema the
model only half-honours.

**Pages render dynamically on purpose.** The Content-Security-Policy is
nonce-based, and a nonce is only worth anything if it is fresh per request.
Prerendering would bake one nonce into the HTML while middleware kept issuing
new ones, and `'strict-dynamic'` would then reject every script the app ships.
Static rendering is the thing being traded away here, deliberately.

**The design system is deliberately flat.** Zero border radius, no shadows,
hierarchy carried by 2px rules and tracked uppercase labels. Three tones are
darkened from the source palette because the originals sat below the 4.5:1
contrast threshold at the sizes used.

---

## Development

```bash
npm run dev            # dev server
npm run build          # production build
npm run typecheck      # tsc --noEmit
npm run lint           # eslint, zero warnings tolerated
npm run format         # prettier --write
npm test               # vitest
npm run test:e2e       # playwright, journeys + a11y
npm run test:a11y      # axe on every route, including RTL
npm run translate -- --check   # verify every catalog matches en.json
```

### Internationalisation

Thirteen languages, English plus twelve Indian languages, with Urdu rendered
right-to-left. `messages/en.json` is the source; `npm run translate` fills the
rest via Google Cloud Translation and never overwrites a reviewed string.
`--check` enforces key parity and is worth running in CI.

Adding a string means adding it to `en.json` and running `translate`. A key
present in the source but missing elsewhere is a build-time failure, not a blank
space at runtime.

### Accessibility

Every route is checked with axe at WCAG 2 AA, in both LTR and RTL, and there are
tests for heading order, unique ids, real form labels, one `main` landmark, and
a working skip link. Please keep them passing — this is a public service, and
much of its audience is reading it on a shared phone.

### Not yet translated

`src/features/trust/lib/legal.ts` and `src/features/walkthrough/lib/checklist.ts`
hold English-only content. These carry statutory citations and confidentiality
guarantees, and machine translation was deliberately **not** applied: wrong
wording on "your answers are inadmissible in court" is worse than English. They
need a human translator.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · next-intl ·
Zod · Groq · Recharts · Vitest · Playwright
