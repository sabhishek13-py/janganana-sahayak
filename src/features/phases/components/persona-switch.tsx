'use client';
// Interactive: a radio group that swaps the "what changes for me" guidance.

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { PHASE_I, PHASE_II } from '@/data/census2027';

import { personaById, PERSONAS, type PersonaId } from '../lib/personas';

/**
 * One segment. The radio stays in the DOM and is only visually hidden, so this
 * is still a real radio group to a screen reader and to the keyboard.
 */
function PersonaOption({
  option,
  isSelected,
  onSelect,
}: {
  readonly option: (typeof PERSONAS)[number];
  readonly isSelected: boolean;
  readonly onSelect: () => void;
}) {
  const t = useTranslations('phases');
  const id = `persona-${option.id.toLowerCase()}`;
  return (
    // The label wraps the input *and* names it by id: wrapping alone is valid
    // HTML, but an explicit pair is what assistive tech reports most reliably.
    <label
      htmlFor={id}
      className="relative inline-flex min-h-touch cursor-pointer items-center border-2 border-line-strong bg-surface px-4 py-2 text-[0.75rem] font-extrabold uppercase tracking-[0.1em] text-ink-subtle transition-colors hover:bg-primary-100 has-[:checked]:bg-line-strong has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-600"
    >
      {/*
        The radio is transparent rather than `sr-only`, and stretched over the
        whole segment. Hiding it outright leaves the label intercepting every
        pointer event, so the control the browser reports is not the one anyone
        can actually click — including assistive tech driving a synthetic click.
      */}
      <input
        id={id}
        type="radio"
        name="persona"
        value={option.id}
        checked={isSelected}
        onChange={onSelect}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
      {t(option.labelKey)}
    </label>
  );
}

function PersonaOptions({
  selected,
  onSelect,
}: {
  readonly selected: PersonaId;
  readonly onSelect: (id: PersonaId) => void;
}) {
  const t = useTranslations('phases');
  return (
    <fieldset>
      <legend className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
        {t('whatChanges')}
      </legend>
      {/* A segmented control: the options abut and share one edge. */}
      <div className="flex flex-wrap [&>label:first-child]:ml-0 [&>label]:-ml-0.5">
        {PERSONAS.map((option) => (
          <PersonaOption
            key={option.id}
            option={option}
            isSelected={selected === option.id}
            onSelect={() => {
              onSelect(option.id);
            }}
          />
        ))}
      </div>
    </fieldset>
  );
}

/** @requirement REQ-1 Explain the two phases and what each collects */
export function PersonaSwitch() {
  const t = useTranslations('phases');
  const [selected, setSelected] = useState<PersonaId>('RENTER');
  const persona = personaById(selected);

  return (
    <div className="space-y-4">
      <PersonaOptions selected={selected} onSelect={setSelected} />

      <dl className="border-2 border-line-strong">
        {[
          { term: PHASE_I.shortName, detail: persona.phaseOne },
          { term: PHASE_II.shortName, detail: persona.phaseTwo },
          { term: t('notCollected'), detail: persona.reassurance },
        ].map((row) => (
          <div key={row.term} className="border-t border-line-row p-4 first:border-t-0">
            <dt className="meta-label">{row.term}</dt>
            <dd className="mt-2 max-w-[62ch] leading-[1.6] text-ink">{row.detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
