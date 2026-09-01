import { useTranslations } from 'next-intl';

import { Section } from '@/components/ui/page';

import { DOCUMENT_CHECKLIST } from '../lib/checklist';

/** @requirement REQ-3 Guide users through self-enumeration */
export function DocumentChecklist() {
  const t = useTranslations('walkthrough');
  return (
    <Section label={t('checklist')}>
      <ul className="border-b border-line-row">
        {DOCUMENT_CHECKLIST.map((item) => (
          <li key={item.id} className="border-t border-line-row py-4 first:border-t-0 first:pt-0">
            <p className="font-semibold">{item.label}</p>
            <p className="mt-1.5 max-w-[62ch] text-meta leading-[1.6] text-ink-subtle">
              {item.why}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
