# REQ-2 - Schedule

Implements REQ-2: State-wise self-enumeration and survey dates.

## Route

`/schedule` (`src/app/[locale]/schedule/page.tsx`)

## What it does

- A State/UT picker that is complete for all 36 territories and is the
  authoritative path. Google Maps reverse geocoding, when a key is configured,
  only pre-selects it; without a key the picker is unchanged.
- Resolves the self-enumeration window, the houselisting window, the Population
  Enumeration month and the reference date, including the snow-bound exceptions.
- A live countdown to the opening of the self-enumeration window.
- A searchable national table for all 36 territories.
- A tile cartogram of notification status, paired with that table as its
  accessible text equivalent.
- An `.ics` export containing public census dates only.

## Ground-truth rule

Self-enumeration is the 15-day window ending the day before houselisting begins.
`deriveSelfEnumerationWindow` encodes this, and a test asserts every notified
window in the dataset matches it. Territories with no notification carry
`AWAITING_STATE_NOTIFICATION` and null windows; no date is ever invented.

## Files

| Concern                  | File                               |
| ------------------------ | ---------------------------------- |
| Window resolution        | `lib/schedule-lookup.ts`           |
| Date and countdown maths | `lib/dates.ts`                     |
| Calendar export          | `lib/ics.ts`                       |
| Maps geocoding           | `lib/geocode.ts`                   |
| Name to code matching    | `lib/territory-matching.ts`        |
| Tests                    | `__tests__/req-2-schedule.test.ts` |
