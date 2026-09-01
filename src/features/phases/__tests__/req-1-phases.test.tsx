import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PHASE_I, PHASE_II, phaseSchema } from '@/data/census2027';
import { renderWithIntl } from '@/test/render-with-intl';

import { PersonaSwitch } from '../components/persona-switch';
import { PhaseComparison } from '../components/phase-comparison';
import { personaById, PERSONA_IDS, PERSONAS } from '../lib/personas';

describe('REQ-1 phase ground truth', () => {
  it('describes Phase I as notified with 33 questions', () => {
    expect(() => phaseSchema.parse(PHASE_I)).not.toThrow();
    expect(PHASE_I.questionsNotified).toBe(true);
    expect(PHASE_I.questionCount).toBe(33);
  });

  it('refuses to invent Phase II questions', () => {
    expect(PHASE_II.questionsNotified).toBe(false);
    expect(PHASE_II.questionCount).toBeNull();
  });

  it('states what is NOT collected for every topic in both phases', () => {
    for (const phase of [PHASE_I, PHASE_II]) {
      expect(phase.topics.length).toBeGreaterThan(0);
      for (const topic of phase.topics) {
        expect(topic.why.length).toBeGreaterThan(10);
        expect(topic.notCollected.length).toBeGreaterThan(10);
      }
    }
  });

  it('includes caste enumeration among the Phase II topics', () => {
    expect(PHASE_II.topics.map((topic) => topic.id)).toContain('caste');
  });
});

describe('REQ-1 persona guidance', () => {
  it('covers renter, owner, migrant and homeless', () => {
    expect(PERSONAS.map((persona) => persona.id)).toEqual([...PERSONA_IDS]);
  });

  it('resolves each persona by id and throws on an unknown one', () => {
    for (const id of PERSONA_IDS) expect(personaById(id).id).toBe(id);
    // @ts-expect-error - deliberately passing an id outside the union
    expect(() => personaById('TOURIST')).toThrow();
  });
});

describe('REQ-1 phase comparison UI', () => {
  it('reveals why a category is asked and what is not collected', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PhaseComparison />);

    const trigger = screen.getByRole('button', { name: 'Household assets' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/no bank balance/i)).toBeInTheDocument();
  });

  it('says plainly that Phase II questions are not yet notified', () => {
    renderWithIntl(<PhaseComparison />);
    expect(screen.getByText('Questions not yet notified')).toBeInTheDocument();
  });
});

describe('REQ-1 what changes for me', () => {
  it('swaps guidance when a different situation is chosen', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PersonaSwitch />);

    expect(screen.getByText(/you answer for the home you live in/i)).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'I have no fixed address' }));
    expect(screen.getByText(/counts houseless people separately/i)).toBeInTheDocument();
    expect(screen.getByText(/you do not need an address/i)).toBeInTheDocument();
  });
});
