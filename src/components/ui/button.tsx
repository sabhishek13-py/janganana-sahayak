import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * Modernist buttons: flat, square, a 2px border on every variant so that
 * variants swap colour without shifting layout, and an uppercase tracked label.
 *
 * The design's own buttons are ~40px tall. These keep a 44px minimum instead:
 * this is a public service used on shared phones, and WCAG 2.2 target size is
 * not a detail to trade for four pixels.
 */
const buttonStyles = cva(
  'inline-flex min-h-touch items-center justify-center gap-2.5 border-2 px-5 py-3 text-[0.8125rem] ' +
    'font-semibold uppercase tracking-button transition-colors ' +
    'disabled:cursor-not-allowed disabled:border-primary-400 disabled:bg-primary-400 ' +
    'disabled:text-white',
  {
    variants: {
      variant: {
        primary:
          'border-primary-600 bg-primary-600 text-white hover:border-primary-700 hover:bg-primary-700',
        secondary: 'border-line-strong bg-surface text-ink hover:bg-primary-100',
        /** Outlined in the accent, for a secondary action inside a blue tint. */
        outline: 'border-primary-600 bg-surface text-primary-700 hover:bg-primary-200',
        danger:
          'border-danger bg-danger text-white hover:border-danger-pressed hover:bg-danger-pressed',
        ghost:
          'border-transparent bg-transparent px-1 text-primary-700 hover:bg-primary-100 disabled:border-transparent disabled:bg-transparent disabled:text-ink-quiet',
      },
      size: { default: '', wide: 'w-full justify-start text-left' },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  readonly children: ReactNode;
}

export function Button({ className, variant, size, type, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * A row of buttons that abut, with the shared edge drawn once — the pairing the
 * design uses wherever two actions belong to one decision.
 */
export function ButtonRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center [&>*+*]:border-l-0', className)}>
      {children}
    </div>
  );
}
