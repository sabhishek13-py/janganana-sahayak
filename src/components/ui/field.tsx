import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/cn';

/**
 * Form controls in the Modernist idiom: square, a 2px border that darkens to the
 * accent on focus, and an accent caret. Kept here so every input on the site
 * agrees, rather than each one restating the same class string.
 */
const CONTROL =
  'min-h-touch w-full border-2 border-line bg-surface px-3.5 py-2.5 text-base text-ink ' +
  'caret-primary-600 transition-colors hover:border-ink-quiet focus:border-primary-600 ' +
  'placeholder:text-ink-quiet';

export function FieldLabel({
  htmlFor,
  children,
  className,
}: {
  readonly htmlFor?: string;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'mb-2 block text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle',
        className,
      )}
    >
      {children}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'resize-y leading-[1.6]', className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, className)} {...props} />;
}

export { CONTROL as CONTROL_CLASS };
