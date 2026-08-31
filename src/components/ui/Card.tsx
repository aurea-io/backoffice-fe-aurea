import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'highlight' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  const variants = {
    default:
      'bg-white dark:bg-[#12131e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs rounded-2xl transition-all duration-200',
    glass:
      'bg-white/80 dark:bg-[#11121d]/70 backdrop-blur-md border border-zinc-200/80 dark:border-violet-500/15 shadow-sm rounded-2xl',
    highlight:
      'bg-gradient-to-b from-violet-50/50 to-white dark:from-violet-950/20 dark:to-[#12131e] border border-violet-200/80 dark:border-violet-800/40 shadow-xs rounded-2xl',
    flat: 'bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/40 rounded-2xl',
  };

  return (
    <div className={clsx(variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/60', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx(
        'font-editorial text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx('text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('pt-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between gap-3 pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/60',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
