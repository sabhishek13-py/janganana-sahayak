import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

/**
 * A card in this system is a panel: a 2px ink edge with no radius and no
 * shadow. Depth is not simulated — separation comes from the rule itself.
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('border-2 border-line-strong bg-surface p-6', className)} {...props} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly children: ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('mb-3 text-[1.03125rem] font-bold leading-[1.4] text-ink-title', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-meta leading-[1.65] text-ink-muted', className)} {...props} />;
}

/**
 * The panel header bar: a tinted strip carrying an uppercase section label,
 * with anything passed as `aside` set flush right in the narrow face.
 */
export function CardHeader({
  label,
  aside,
  className,
}: {
  readonly label: string;
  readonly aside?: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn('panel-header', className)}>
      <span>{label}</span>
      {aside !== undefined && (
        <span className="ml-auto font-narrow text-[0.75rem] font-normal normal-case tracking-normal text-ink-subtle">
          {aside}
        </span>
      )}
    </div>
  );
}
