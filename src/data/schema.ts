import { z } from 'zod';

/** `YYYY-MM-DD`. Parsed, never cast — every date in the dataset passes through here. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO YYYY-MM-DD date')
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), 'Not a real calendar date');

/** `YYYY-MM`. */
export const isoMonthSchema = z.string().regex(/^\d{4}-\d{2}$/, 'Expected an ISO YYYY-MM month');

export const dateWindowSchema = z
  .object({ start: isoDateSchema, end: isoDateSchema })
  .refine((w) => w.start <= w.end, 'Window end must not precede its start');

export const scheduleStatusSchema = z.enum(['NOTIFIED', 'AWAITING_STATE_NOTIFICATION']);

export const phaseTwoTrackSchema = z.enum(['NATIONAL', 'SNOW_BOUND', 'SNOW_BOUND_PARTIAL']);

export const territoryKindSchema = z.enum(['STATE', 'UNION_TERRITORY']);

export const subAreaSchema = z.object({
  name: z.string().min(1),
  selfEnumeration: dateWindowSchema,
  houselisting: dateWindowSchema,
});

export const territorySchema = z.object({
  /** ISO 3166-2:IN subdivision code. */
  code: z.string().regex(/^[A-Z]{2}$/),
  name: z.string().min(1),
  kind: territoryKindSchema,
  phaseTwoTrack: phaseTwoTrackSchema,
  status: scheduleStatusSchema,
  selfEnumeration: dateWindowSchema.nullable(),
  houselisting: dateWindowSchema.nullable(),
  subAreas: z.array(subAreaSchema).readonly(),
});

export const collectedTopicSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  why: z.string().min(1),
  notCollected: z.string().min(1),
});

export const phaseSchema = z.object({
  id: z.enum(['PHASE_I', 'PHASE_II']),
  name: z.string().min(1),
  shortName: z.string().min(1),
  window: z.string().min(1),
  questionsNotified: z.boolean(),
  questionCount: z.number().int().positive().nullable(),
  topics: z.array(collectedTopicSchema).readonly(),
});

export const hloQuestionSchema = z.object({
  number: z.number().int().min(1).max(33),
  block: z.enum(['BUILDING', 'HOUSING', 'AMENITIES', 'ASSETS', 'HOUSEHOLD']),
  prompt: z.string().min(1),
  help: z.string().min(1),
  kind: z.enum(['TEXT', 'NUMBER', 'SINGLE_CHOICE', 'MULTI_CHOICE']),
  options: z.array(z.string().min(1)).readonly(),
});

export const baselineSchema = z.object({
  code: z.string().regex(/^[A-Z]{2}$/),
  population2011: z.number().int().positive(),
  literacyRate2011: z.number().min(0).max(100),
  urbanSharePct2011: z.number().min(0).max(100),
  decadalGrowthPct2001To2011: z.number(),
  sexRatio2011: z.number().int().positive(),
});

export type IsoDate = z.infer<typeof isoDateSchema>;
export type DateWindow = z.infer<typeof dateWindowSchema>;
export type ScheduleStatus = z.infer<typeof scheduleStatusSchema>;
export type PhaseTwoTrack = z.infer<typeof phaseTwoTrackSchema>;
export type Territory = z.infer<typeof territorySchema>;
export type SubArea = z.infer<typeof subAreaSchema>;
export type CensusPhase = z.infer<typeof phaseSchema>;
export type CollectedTopic = z.infer<typeof collectedTopicSchema>;
export type HloQuestion = z.infer<typeof hloQuestionSchema>;
export type StateBaseline = z.infer<typeof baselineSchema>;
