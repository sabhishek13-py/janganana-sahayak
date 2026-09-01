import { territorySchema, type DateWindow, type Territory } from './schema';

/**
 * Notified windows, Census 2027. Every State/UT is modelled in the same schema;
 * anything not yet notified by its State/UT carries AWAITING_STATE_NOTIFICATION
 * and null windows rather than a guessed date.
 */
const GROUP_A_SELF: DateWindow = { start: '2026-04-01', end: '2026-04-15' };
const GROUP_A_HLO: DateWindow = { start: '2026-04-16', end: '2026-05-15' };
const MANIPUR_SELF: DateWindow = { start: '2026-08-17', end: '2026-08-31' };
const MANIPUR_HLO: DateWindow = { start: '2026-09-01', end: '2026-09-30' };

type Draft = Omit<Territory, 'kind' | 'status' | 'phaseTwoTrack' | 'subAreas'> &
  Partial<Pick<Territory, 'phaseTwoTrack' | 'subAreas'>>;

const build = (kind: Territory['kind'], draft: Draft): Territory =>
  territorySchema.parse({
    ...draft,
    kind,
    phaseTwoTrack: draft.phaseTwoTrack ?? 'NATIONAL',
    subAreas: draft.subAreas ?? [],
    status: draft.houselisting === null ? 'AWAITING_STATE_NOTIFICATION' : 'NOTIFIED',
  });

const state = (code: string, name: string, extra: Partial<Draft> = {}): Territory =>
  build('STATE', { code, name, selfEnumeration: null, houselisting: null, ...extra });

const ut = (code: string, name: string, extra: Partial<Draft> = {}): Territory =>
  build('UNION_TERRITORY', { code, name, selfEnumeration: null, houselisting: null, ...extra });

/** Notified in the first tranche: self-enumeration 1–15 Apr 2026, HLO 16 Apr – 15 May 2026. */
const groupA = { selfEnumeration: GROUP_A_SELF, houselisting: GROUP_A_HLO } as const;

/** Snow-bound, non-synchronous areas run Population Enumeration in September 2026. */
const partialSnow = { phaseTwoTrack: 'SNOW_BOUND_PARTIAL' } as const;

export const TERRITORIES: readonly Territory[] = Object.freeze([
  state('AP', 'Andhra Pradesh'),
  state('AR', 'Arunachal Pradesh'),
  state('AS', 'Assam'),
  state('BR', 'Bihar'),
  state('CT', 'Chhattisgarh'),
  state('GA', 'Goa', groupA),
  state('GJ', 'Gujarat'),
  state('HR', 'Haryana'),
  state('HP', 'Himachal Pradesh', partialSnow),
  state('JH', 'Jharkhand'),
  state('KA', 'Karnataka', groupA),
  state('KL', 'Kerala'),
  state('MP', 'Madhya Pradesh'),
  state('MH', 'Maharashtra'),
  state('MN', 'Manipur', { selfEnumeration: MANIPUR_SELF, houselisting: MANIPUR_HLO }),
  state('ML', 'Meghalaya'),
  state('MZ', 'Mizoram', groupA),
  state('NL', 'Nagaland'),
  state('OR', 'Odisha', groupA),
  state('PB', 'Punjab'),
  state('RJ', 'Rajasthan'),
  state('SK', 'Sikkim', groupA),
  state('TN', 'Tamil Nadu'),
  state('TG', 'Telangana'),
  state('TR', 'Tripura'),
  state('UP', 'Uttar Pradesh'),
  state('UT', 'Uttarakhand', partialSnow),
  state('WB', 'West Bengal'),
  ut('AN', 'Andaman and Nicobar Islands', groupA),
  ut('CH', 'Chandigarh'),
  ut('DH', 'Dadra and Nagar Haveli and Daman and Diu'),
  ut('DL', 'Delhi (NCT)', {
    subAreas: [
      { name: 'NDMC area', selfEnumeration: GROUP_A_SELF, houselisting: GROUP_A_HLO },
      { name: 'Delhi Cantonment', selfEnumeration: GROUP_A_SELF, houselisting: GROUP_A_HLO },
    ],
  }),
  ut('JK', 'Jammu and Kashmir', partialSnow),
  ut('LA', 'Ladakh', { phaseTwoTrack: 'SNOW_BOUND' }),
  ut('LD', 'Lakshadweep', groupA),
  ut('PY', 'Puducherry'),
]);

export const TERRITORY_BY_CODE: ReadonlyMap<string, Territory> = new Map(
  TERRITORIES.map((territory) => [territory.code, territory]),
);
