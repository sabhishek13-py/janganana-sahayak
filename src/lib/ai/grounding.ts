import { CENSUS_2027, PHASE_I, PHASE_II, TERRITORIES } from '@/data/census2027';

const line = (label: string, value: string): string => `- ${label}: ${value}`;

function coreFacts(): readonly string[] {
  const { houselisting: hlo, populationEnumeration: pe, selfEnumeration: self } = CENSUS_2027;
  return [
    line('Census number', `${CENSUS_2027.censusNumber}th census of India`),
    line('Since Independence', `${CENSUS_2027.censusesSinceIndependence}th`),
    line('Gazette notification', CENSUS_2027.gazetteNotificationDate),
    line('Outlay', `Rs ${CENSUS_2027.outlayCroreInr} crore`),
    line('Field functionaries', CENSUS_2027.fieldFunctionaries.label),
    line('Phase I window', `${hlo.nationalWindow.start} to ${hlo.nationalWindow.end}`),
    line('Phase I per-territory window', `${hlo.perTerritoryWindowDays} days`),
    line('Phase I questions', `${hlo.questionCount}, notified ${hlo.questionsNotifiedOn}`),
    line('Self-enumeration', `${self.windowDays} days immediately before the Phase I window`),
    line('Self-enumeration portal languages', String(self.portalLanguages)),
    line('Self-enumeration ID', 'issued on completion and shown to the enumerator'),
    line('Phase II month', pe.nationalMonth),
    line('Phase II questions', 'NOT YET NOTIFIED'),
    line('Caste enumeration', `included; first since ${pe.lastCasteEnumerationYear}`),
    line('Reference date', CENSUS_2027.referenceDates.standard),
    line('Snow-bound reference date', CENSUS_2027.referenceDates.snowBound),
    line('Snow-bound Phase II month', pe.snowBoundMonth),
    line('Official portal', CENSUS_2027.officialPortalUrl),
  ];
}

function phaseTopics(): readonly string[] {
  return [PHASE_I, PHASE_II].flatMap((phase) => [
    `${phase.shortName} (${phase.name}), ${phase.window}:`,
    ...phase.topics.map(
      (topic) => `  - ${topic.label}. Why: ${topic.why} Not collected: ${topic.notCollected}`,
    ),
  ]);
}

function notifiedWindows(): readonly string[] {
  return TERRITORIES.map((territory) => {
    if (territory.houselisting === null) {
      return `  - ${territory.name}: AWAITING_STATE_NOTIFICATION`;
    }
    const self = territory.selfEnumeration;
    const selfText = self === null ? 'derived' : `${self.start} to ${self.end}`;
    return `  - ${territory.name}: self-enumeration ${selfText}, houselisting ${territory.houselisting.start} to ${territory.houselisting.end}`;
  });
}

/**
 * The only facts the model is allowed to use. Built from the frozen dataset, so
 * grounding can never drift from what the app itself displays.
 */
export function buildGroundingContext(): string {
  return [
    'CENSUS 2027 GROUNDING DATA (the only facts you may use):',
    ...coreFacts(),
    '',
    'WHAT EACH PHASE COLLECTS:',
    ...phaseTopics(),
    '',
    'NOTIFIED WINDOWS BY STATE/UT:',
    ...notifiedWindows(),
  ].join('\n');
}

/** Memoised: the dataset is frozen, so this string is built once per process. */
let cached: string | undefined;
export const groundingContext = (): string => (cached ??= buildGroundingContext());
