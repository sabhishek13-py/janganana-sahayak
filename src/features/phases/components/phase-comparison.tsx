'use client';
// Interactive: selecting a data category reveals its detail panel.

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Callout } from '@/components/ui/callout';
import { PHASE_I, PHASE_II, type CensusPhase, type CollectedTopic } from '@/data/census2027';

function TopicDetail({ topic }: { readonly topic: CollectedTopic }) {
  const t = useTranslations('phases');
  return (
    <div className="space-y-4 bg-primary-100 p-4">
      <div>
        <h4 className="meta-label">{t('why')}</h4>
        <p className="mt-1.5 max-w-[62ch] text-meta leading-[1.6] text-ink">{topic.why}</p>
      </div>
      <div>
        <h4 className="meta-label">{t('notCollected')}</h4>
        <p className="mt-1.5 max-w-[62ch] text-meta leading-[1.6] text-ink">{topic.notCollected}</p>
      </div>
    </div>
  );
}

function TopicList({ topics }: { readonly topics: CensusPhase['topics'] }) {
  const [openTopic, setOpenTopic] = useState<string>();
  return (
    <ul className="border-b border-line-row">
      {topics.map((topic) => {
        const isOpen = openTopic === topic.id;
        return (
          <li key={topic.id} className="border-t border-line-row first:border-t-0">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`topic-${topic.id}`}
              onClick={() => {
                setOpenTopic(isOpen ? undefined : topic.id);
              }}
              className="flex min-h-touch w-full items-center gap-3 py-3 pr-1 text-left font-semibold transition-colors hover:bg-primary-100"
            >
              <span aria-hidden="true" className="w-3 shrink-0 font-narrow text-primary-600">
                {isOpen ? '\u2212' : '+'}
              </span>
              <span className="min-w-0 flex-1">{topic.label}</span>
            </button>
            <div id={`topic-${topic.id}`} hidden={!isOpen} className="pb-4">
              {isOpen && <TopicDetail topic={topic} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function PhaseColumn({ phase }: { readonly phase: CensusPhase }) {
  const t = useTranslations('phases');

  return (
    <section aria-labelledby={`phase-${phase.id}`} className="space-y-5">
      <div className="border-b-2 border-line-strong pb-4">
        <h3 id={`phase-${phase.id}`}>{phase.shortName}</h3>
        <p className="mt-1.5 text-meta text-ink-muted">{phase.name}</p>
        <p className="mt-2 font-narrow text-[0.8125rem] text-ink-faint">{phase.window}</p>
      </div>

      <Callout tone={phase.questionsNotified ? 'ok' : 'warn'}>
        {phase.questionsNotified
          ? `${t('questionsNotified')}: ${String(phase.questionCount)} questions.`
          : t('questionsNotNotified')}
      </Callout>

      <div>
        <h4 className="meta-label mb-2">{t('collects')}</h4>
        <TopicList topics={phase.topics} />
      </div>
    </section>
  );
}

/** @requirement REQ-1 Explain the two phases and what each collects */
export function PhaseComparison() {
  const t = useTranslations('phases');
  return (
    <div className="space-y-5">
      <p className="font-narrow text-[0.8125rem] text-ink-faint">{t('selectCategory')}</p>
      {/* Two columns separated by a rule, stacking to one on a phone. */}
      <div className="grid gap-10 md:grid-cols-2 md:gap-0">
        <div className="md:pr-8">
          <PhaseColumn phase={PHASE_I} />
        </div>
        <div className="md:border-l-2 md:border-line-strong md:pl-8">
          <PhaseColumn phase={PHASE_II} />
        </div>
      </div>
    </div>
  );
}
