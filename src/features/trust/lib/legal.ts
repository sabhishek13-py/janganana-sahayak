export interface LegalPoint {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly citation: string;
}

/**
 * @requirement REQ-4 Data privacy and misinformation
 * Confidentiality guarantees, cited to the provision they come from. Where the
 * exact rule is not quoted, the citation names the instrument rather than
 * inventing a section number.
 */
export const LEGAL_POINTS: readonly LegalPoint[] = Object.freeze([
  {
    id: 'not-inspectable',
    title: 'Your individual answers cannot be inspected by anyone',
    body: 'The filled-in census schedules are not open to inspection, and they are not admissible as evidence in any court. Nobody can ask to see what your household said, and nothing you say can be used against you in a legal proceeding.',
    citation: 'Census Act, 1948, section 15',
  },
  {
    id: 'statistics-only',
    title: 'Only totals are published, never individuals',
    body: 'Census output is aggregate statistics: counts by area, by age group, by amenity. No published table identifies a household or a person.',
    citation: 'Census Act, 1948, section 15, read with the Census Rules, 1990',
  },
  {
    id: 'oath-of-secrecy',
    title: 'Every census officer takes an oath of secrecy',
    body: 'Enumerators and supervisors are bound to secrecy about what they record. Disclosing your answers is a punishable offence for them, not merely a breach of policy.',
    citation: 'Census Act, 1948, sections 11 and 15',
  },
  {
    id: 'no-verification-demand',
    title: 'No document is demanded as proof',
    body: 'Houselisting records what you report. You are not asked to produce Aadhaar, a ration card, property papers or a bank passbook to substantiate an answer.',
    citation: 'Houselisting schedule, Census 2027',
  },
  {
    id: 'obligation-to-answer',
    title: 'You are required to answer, and answering truthfully protects you',
    body: 'The law requires occupants to answer census questions truthfully. That obligation runs alongside the confidentiality guarantee: you answer, and the answer stays sealed.',
    citation: 'Census Act, 1948, section 11',
  },
]);

export interface VerificationStep {
  readonly id: string;
  readonly instruction: string;
  readonly detail: string;
}

/** How to tell a genuine enumerator from someone at your door claiming to be one. */
export const VERIFICATION_STEPS: readonly VerificationStep[] = Object.freeze([
  {
    id: 'id-card',
    instruction: 'Ask to see the census identity card',
    detail:
      'Genuine enumerators carry an identity card issued for census work, with a photograph and an appointment number.',
  },
  {
    id: 'appointment-letter',
    instruction: 'Ask which charge or block they are working',
    detail:
      'An enumerator is assigned a specific enumeration block and can name it, along with their supervisor.',
  },
  {
    id: 'local-office',
    instruction: 'Check with the local census or municipal office',
    detail:
      'District census offices can confirm whether an enumerator is assigned to your area. It is reasonable to ask them to wait while you check.',
  },
  {
    id: 'no-payment',
    instruction: 'Refuse any request for money, an OTP or a bank detail',
    detail:
      'No stage of the census involves a payment, a one-time password, a bank account number or a card number. Such a request is proof the caller is not from the census.',
  },
  {
    id: 'self-enumerate',
    instruction: 'Self-enumerate to avoid a doorstep visit entirely',
    detail:
      'Completing self-enumeration on the official portal gives you an ID to show, and no enumerator interview is needed.',
  },
]);

/** Things no census interaction ever involves. Stated flatly, for forwarding. */
export const CENSUS_NEVER_ASKS: readonly string[] = Object.freeze([
  'A bank account number, an IFSC code, or a card number',
  'A one-time password, PIN, or any password',
  'A payment, fee, fine or deposit of any kind',
  'A UPI request, QR code scan, or money transfer',
  'An Aadhaar OTP or a copy of your Aadhaar as proof of an answer',
  'Remote access to your phone or computer',
  'An app installed from a link sent over a message',
]);
