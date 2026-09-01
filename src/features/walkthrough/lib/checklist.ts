/**
 * @requirement REQ-3 Guide users through self-enumeration
 * Things worth having to hand. Deliberately short, and deliberately says that
 * none of it is demanded as proof - houselisting records what you report.
 */
export interface ChecklistItem {
  readonly id: string;
  readonly label: string;
  readonly why: string;
}

export const DOCUMENT_CHECKLIST: readonly ChecklistItem[] = Object.freeze([
  {
    id: 'address',
    label: 'Your full address, including any municipal building number',
    why: 'The first questions identify the building and the census house.',
  },
  {
    id: 'household-members',
    label: 'A rough count of who usually lives with you',
    why: 'Used for the household questions, such as the number of married couples.',
  },
  {
    id: 'rooms',
    label: 'The number of rooms your household uses for living and sleeping',
    why: 'Asked directly; kitchens and bathrooms are not counted.',
  },
  {
    id: 'amenities',
    label: 'How you get drinking water, lighting and cooking fuel',
    why: 'The amenities block asks about your main source for each.',
  },
  {
    id: 'assets',
    label: 'Which household items you own and that still work',
    why: 'The assets block asks yes or no for each item.',
  },
  {
    id: 'nothing-else',
    label: 'Nothing else. No Aadhaar, no bank details, no property papers',
    why: 'Houselisting records what you report. No document is demanded as proof.',
  },
]);
