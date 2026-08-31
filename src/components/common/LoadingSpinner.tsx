import React from 'react';
import clsx from 'clsx';
import { Logo } from '../ui/Logo';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  label,
  className,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 p-6', className)}>
      <div
        className={clsx(
          'rounded-full border-violet-200 dark:border-violet-950 border-t-violet-600 dark:border-t-violet-400 animate-spin',
          sizes[size],
        )}
      />
      {label && (
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
          {label}
        </p>
      )}
    </div>
  );
}

export function FullPageLoader({ message = 'Cargando Aurea Backoffice...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-zinc-50 dark:bg-[#0c0d12] flex flex-col items-center justify-center z-50">
      <div className="mb-6">
        <Logo size="lg" isLink={false} />
      </div>
      <LoadingSpinner size="md" label={message} />
    </div>
  );
}
