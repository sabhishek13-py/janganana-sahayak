import { z } from 'zod';

export const PERSONA_IDS = ['RENTER', 'OWNER', 'MIGRANT', 'HOMELESS'] as const;
export type PersonaId = (typeof PERSONA_IDS)[number];

const personaSchema = z.object({
  id: z.enum(PERSONA_IDS),
  labelKey: z.enum(['personaRenter', 'personaOwner', 'personaMigrant', 'personaHomeless']),
  phaseOne: z.string().min(1),
  phaseTwo: z.string().min(1),
  reassurance: z.string().min(1),
});

export type Persona = z.infer<typeof personaSchema>;

/**
 * @requirement REQ-1 Explain the two phases and what each collects
 * Plain guidance on what each phase means for a person in a particular
 * situation. Deliberately avoids anything that is not yet notified.
 */
export const PERSONAS: readonly Persona[] = Object.freeze(
  [
    {
      id: 'RENTER',
      labelKey: 'personaRenter',
      phaseOne:
        'You answer for the home you live in, not the one you own. Questions about wall, roof and amenities describe your rented home as it is today.',
      phaseTwo:
        'You are counted where you usually live, which is your rented home, not your landlord’s address.',
      reassurance:
        'You are not asked for your rent, your lease, or your landlord’s details, and nothing you say is shared with them.',
    },
    {
      id: 'OWNER',
      labelKey: 'personaOwner',
      phaseOne:
        'You describe the house you live in. If you own more than one property, only the one you live in is your census house.',
      phaseTwo:
        'Everyone who usually lives in your household is listed, including members away for a short time.',
      reassurance:
        'No property valuation, no ownership documents and no tax details are collected.',
    },
    {
      id: 'MIGRANT',
      labelKey: 'personaMigrant',
      phaseOne:
        'Your current home is listed where you are living now. Your home in your native place is listed separately by the household living there.',
      phaseTwo:
        'Migration particulars ask where you were born and where you last lived, so that movement across India is counted properly.',
      reassurance:
        'Being counted at your current address does not affect any entitlement at your native place, and does not change any document you hold.',
    },
    {
      id: 'HOMELESS',
      labelKey: 'personaHomeless',
      phaseOne:
        'Houselisting covers buildings, so it may not reach you. The census counts houseless people separately, in a dedicated round.',
      phaseTwo:
        'Enumerators visit places where houseless people are known to stay, so that you are counted without needing an address.',
      reassurance:
        'You do not need an address, an identity document or a fixed place to be counted.',
    },
  ].map((persona) => personaSchema.parse(persona)),
);

export const personaById = (id: PersonaId): Persona => {
  const found = PERSONAS.find((persona) => persona.id === id);
  if (found === undefined) throw new Error(`Unknown persona ${id}`);
  return found;
};
