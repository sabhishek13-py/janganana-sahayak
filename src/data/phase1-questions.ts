/* eslint-disable max-lines -- a flat table of the 33 notified questions, not logic to break up */
import { hloQuestionSchema, type HloQuestion } from './schema';

/**
 * The 33 notified Houselisting questions, written in plain language for the
 * rehearsal at /walkthrough.
 *
 * IMPORTANT: the official notified wording is published by the Registrar General
 * of India. The text below is an illustrative plain-language rendering of the
 * same subject matter, so that a first-time reader can practise. The app says so
 * on the page. It is never presented as the official schedule.
 */
export const WORDING_IS_ILLUSTRATIVE = true;

type Kind = HloQuestion['kind'];
type Block = HloQuestion['block'];

let counter = 0;
const q = (block: Block, prompt: string, help: string, kind: Kind, options: string[] = []) =>
  hloQuestionSchema.parse({ number: ++counter, block, prompt, help, kind, options });

const YES_NO = ['Yes', 'No'];

export const PHASE_1_QUESTIONS: readonly HloQuestion[] = Object.freeze([
  q(
    'BUILDING',
    'Building number',
    'The municipal number on your building, or the number an enumerator has chalked on it.',
    'TEXT',
  ),
  q(
    'BUILDING',
    'Census house number',
    'A census house is any structure with a separate entrance. One building can hold several.',
    'TEXT',
  ),
  q(
    'BUILDING',
    'Floor on which the census house is located',
    'Ground floor counts as 0.',
    'NUMBER',
  ),
  q(
    'BUILDING',
    'Predominant material of the floor',
    'Look at most of the floor area, not one room.',
    'SINGLE_CHOICE',
    ['Mud', 'Wood or bamboo', 'Brick', 'Stone', 'Cement', 'Mosaic or tiles', 'Other'],
  ),
  q(
    'BUILDING',
    'Predominant material of the wall',
    'The material most of the outer walls are made of.',
    'SINGLE_CHOICE',
    [
      'Grass or thatch',
      'Plastic or polythene',
      'Mud or unburnt brick',
      'Wood',
      'Burnt brick',
      'Stone',
      'Concrete',
      'Other',
    ],
  ),
  q(
    'BUILDING',
    'Predominant material of the roof',
    'The material covering most of the roof.',
    'SINGLE_CHOICE',
    [
      'Grass or thatch',
      'Plastic or polythene',
      'Tiles',
      'Metal sheet',
      'Brick',
      'Stone',
      'Concrete',
      'Other',
    ],
  ),
  q(
    'HOUSING',
    'Use to which the census house is put',
    'A house can be used as a home, a shop, or both.',
    'SINGLE_CHOICE',
    [
      'Residence',
      'Residence cum other use',
      'Shop or office',
      'School or institution',
      'Place of worship',
      'Vacant',
      'Other',
    ],
  ),
  q(
    'HOUSING',
    'Condition of the census house',
    'Good means no repairs needed. Dilapidated means it needs major work.',
    'SINGLE_CHOICE',
    ['Good', 'Livable', 'Dilapidated'],
  ),
  q(
    'HOUSING',
    'Household number',
    'Households are numbered in order within a census house.',
    'NUMBER',
  ),
  q(
    'HOUSING',
    'Name of the head of the household',
    'In this rehearsal, do not type a real name. Nothing here is saved or sent.',
    'TEXT',
  ),
  q(
    'HOUSING',
    'Sex of the head of the household',
    'As reported by the household.',
    'SINGLE_CHOICE',
    ['Male', 'Female', 'Other'],
  ),
  q(
    'HOUSING',
    'Whether the head belongs to a Scheduled Caste or Scheduled Tribe',
    'Answered as reported; no proof is asked for.',
    'SINGLE_CHOICE',
    ['Scheduled Caste', 'Scheduled Tribe', 'Neither'],
  ),
  q(
    'HOUSING',
    'Ownership status of the house',
    'Owned means the household owns it, whatever the paperwork says.',
    'SINGLE_CHOICE',
    ['Owned', 'Rented', 'Any other'],
  ),
  q(
    'HOUSING',
    'Number of dwelling rooms the household lives in',
    'Count rooms used for living and sleeping, not the kitchen or bathroom.',
    'NUMBER',
  ),
  q(
    'HOUSING',
    'Number of married couples living in the household',
    'Zero is a valid answer.',
    'NUMBER',
  ),
  q(
    'AMENITIES',
    'Main source of drinking water',
    'The source used for most of the year.',
    'SINGLE_CHOICE',
    [
      'Tap water from treated source',
      'Tap water from untreated source',
      'Covered well',
      'Uncovered well',
      'Handpump',
      'Tubewell or borehole',
      'Spring',
      'River or canal',
      'Tank or pond',
      'Other',
    ],
  ),
  q(
    'AMENITIES',
    'Location of the drinking water source',
    'Whether you have to leave the premises to fetch it.',
    'SINGLE_CHOICE',
    ['Within the premises', 'Near the premises', 'Away from the premises'],
  ),
  q(
    'AMENITIES',
    'Availability of drinking water',
    'Whether the supply is there throughout the year.',
    'SINGLE_CHOICE',
    ['Throughout the year', 'Seasonal', 'Occasional'],
  ),
  q(
    'AMENITIES',
    'Main source of lighting',
    'What lights the home in the evening.',
    'SINGLE_CHOICE',
    ['Electricity', 'Kerosene', 'Solar energy', 'Other oil', 'Any other', 'No lighting'],
  ),
  q('AMENITIES', 'Type of latrine facility', 'What the household actually uses.', 'SINGLE_CHOICE', [
    'Flush to piped sewer',
    'Flush to septic tank',
    'Flush to other system',
    'Pit latrine with slab',
    'Pit latrine without slab',
    'Service latrine',
    'Public latrine',
    'Open',
    'Other',
  ]),
  q(
    'AMENITIES',
    'Whether the household has a bathing facility',
    'A separate enclosed space for bathing.',
    'SINGLE_CHOICE',
    ['Bathroom with roof', 'Enclosure without roof', 'No bathing facility'],
  ),
  q(
    'AMENITIES',
    'Type of drainage for waste water',
    'Where water from the kitchen and bathroom goes.',
    'SINGLE_CHOICE',
    ['Closed drainage', 'Open drainage', 'No drainage'],
  ),
  q(
    'AMENITIES',
    'Whether the household has a separate kitchen',
    'A kitchen used only for cooking.',
    'SINGLE_CHOICE',
    [
      'Kitchen inside the house',
      'Cooking inside a living room',
      'Kitchen outside the house',
      'No kitchen',
    ],
  ),
  q('AMENITIES', 'Main fuel used for cooking', 'The fuel used most often.', 'SINGLE_CHOICE', [
    'LPG or PNG',
    'Electricity',
    'Biogas',
    'Firewood',
    'Crop residue',
    'Cow dung cake',
    'Coal or charcoal',
    'Kerosene',
    'Other',
  ]),
  q(
    'ASSETS',
    'Does the household have a radio or transistor?',
    'In working condition.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'ASSETS',
    'Does the household have a television?',
    'In working condition.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'ASSETS',
    'Does the household have an internet connection?',
    'Any connection used at home, including a mobile one.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'ASSETS',
    'Does the household have a computer or laptop?',
    'Including a tablet used as a computer.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'ASSETS',
    'Does the household have a telephone or mobile phone?',
    'Landline, mobile, or both.',
    'SINGLE_CHOICE',
    ['Landline only', 'Mobile only', 'Both', 'Neither'],
  ),
  q(
    'ASSETS',
    'Does the household have a bicycle?',
    'In working condition.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'ASSETS',
    'Does the household have a scooter, motorcycle or moped?',
    'In working condition.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'ASSETS',
    'Does the household have a car, jeep or van?',
    'In working condition.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
  q(
    'HOUSEHOLD',
    'Does any member of the household have a bank account?',
    'Only whether an account exists. No account number is asked for, ever.',
    'SINGLE_CHOICE',
    YES_NO,
  ),
]);
