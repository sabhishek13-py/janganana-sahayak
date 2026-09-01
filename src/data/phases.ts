import { phaseSchema, type CensusPhase } from './schema';

/**
 * What each phase collects, why it is asked, and — equally important for REQ-1 —
 * what it explicitly does NOT collect.
 */
export const PHASE_I: CensusPhase = Object.freeze(
  phaseSchema.parse({
    id: 'PHASE_I',
    name: 'Houselisting and Housing Census',
    shortName: 'Phase I (HLO)',
    window: '1 April 2026 – 30 September 2026, in a 30-day window per State/UT',
    questionsNotified: true,
    questionCount: 33,
    topics: [
      {
        id: 'building-listing',
        label: 'Building and structure listing',
        why: 'Builds the frame of every structure so that no household is missed in Phase II.',
        notCollected:
          'No names of residents and no ownership documents are recorded at this stage.',
      },
      {
        id: 'housing-condition',
        label: 'Condition and material of the census house',
        why: 'Measures housing quality — wall, roof and floor material, and state of repair.',
        notCollected: 'No valuation of your property and no rent amount.',
      },
      {
        id: 'amenities',
        label: 'Household amenities',
        why: 'Records drinking water, electricity, toilet, drainage, kitchen and fuel access.',
        notCollected: 'No utility account numbers and no meter readings.',
      },
      {
        id: 'assets',
        label: 'Household assets',
        why: 'Counts durable goods such as a radio, television, bicycle, vehicle or telephone.',
        notCollected: 'No bank balance, no income figure and no investment details.',
      },
      {
        id: 'geo-tagging',
        label: 'Geo-tagging of the structure',
        why: 'Attaches map coordinates to the building so enumerators can find it again.',
        notCollected:
          'Your live location is not tracked; a single point for the structure is stored.',
      },
      {
        id: 'structure-id',
        label: 'Unique structure identification number',
        why: 'Links the Phase I housing record to the Phase II population record.',
        notCollected: 'It is not an identity number for you and is not linked to Aadhaar.',
      },
    ],
  }),
);

export const PHASE_II: CensusPhase = Object.freeze(
  phaseSchema.parse({
    id: 'PHASE_II',
    name: 'Population Enumeration',
    shortName: 'Phase II (PE)',
    window: 'February 2027 (September 2026 for snow-bound, non-synchronous areas)',
    questionsNotified: false,
    questionCount: null,
    topics: [
      {
        id: 'demographic',
        label: 'Demographic particulars',
        why: 'Age, sex and relationship to the head of household for every usual resident.',
        notCollected: 'The exact question wording is not yet notified.',
      },
      {
        id: 'socio-economic',
        label: 'Socio-economic particulars',
        why: 'Education, economic activity and occupation of each member.',
        notCollected: 'The exact question wording is not yet notified.',
      },
      {
        id: 'cultural',
        label: 'Cultural particulars',
        why: 'Religion, mother tongue and other languages known.',
        notCollected: 'The exact question wording is not yet notified.',
      },
      {
        id: 'migration',
        label: 'Migration particulars',
        why: 'Place of birth, place of last residence and reason for moving.',
        notCollected: 'The exact question wording is not yet notified.',
      },
      {
        id: 'fertility',
        label: 'Fertility particulars',
        why: 'Children ever born and surviving, asked of ever-married women.',
        notCollected: 'The exact question wording is not yet notified.',
      },
      {
        id: 'caste',
        label: 'Caste enumeration',
        why: 'Caste is being enumerated for the first time since the 1931 Census.',
        notCollected: 'The caste question and its response format are not yet notified.',
      },
    ],
  }),
);

export const PHASES: readonly CensusPhase[] = Object.freeze([PHASE_I, PHASE_II]);
