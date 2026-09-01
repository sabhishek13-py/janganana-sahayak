'use client';
// Interactive: changes the locale and announces the change to assistive technology.

import { useLocale, useTranslations } from 'next-intl';
import { useTransition, useState, type ChangeEvent } from 'react';

import { FieldLabel, Select } from '@/components/ui/field';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/routing';

/**
 * Each option is set in its own script, so the list is legible before you can
 * read any of it — a reader scanning for their language looks for its own name,
 * not for the English word for it.
 */
function LocaleOptions() {
  return (
    <>
      {LOCALES.map((option) => (
        <option key={option} value={option} lang={option}>
          {LOCALE_LABELS[option]}
        </option>
      ))}
    </>
  );
}

/**
 * @requirement REQ-6 Multiple Indian languages
 * A real <select> with a real <label>. The choice is persisted by next-intl's
 * locale cookie, so it survives navigation and a return visit.
 */
export function LanguageSwitcher() {
  const t = useTranslations('nav');
  const announce = useTranslations('a11y');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [announcement, setAnnouncement] = useState('');

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Locale;
    setAnnouncement(`${announce('languageChanged')}: ${LOCALE_LABELS[next]}`);
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-3">
      <FieldLabel htmlFor="language-switcher" className="mb-0 whitespace-nowrap">
        {t('language')}
      </FieldLabel>
      <Select
        id="language-switcher"
        name="language"
        value={locale}
        onChange={handleChange}
        disabled={isPending}
        className="w-auto border-line-strong py-2"
      >
        <LocaleOptions />
      </Select>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
