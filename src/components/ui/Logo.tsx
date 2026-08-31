import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitleText?: string;
  isLink?: boolean;
  href?: string;
  className?: string;
}

export function Logo({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'pages',
  isLink = true,
  href = '/',
  className,
}: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-base rounded-lg',
    md: 'w-9 h-9 text-xl rounded-xl',
    lg: 'w-11 h-11 text-2xl rounded-2xl',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.2',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-0.5',
  };

  const content = (
    <div className={clsx('flex items-center gap-2.5 select-none group', className)}>
      {/* Stylized Monogram Icon */}
      <div
        className={clsx(
          'relative flex items-center justify-center font-editorial font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105',
          'bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700',
          'border border-white/25 dark:border-violet-400/30 violet-glow-subtle',
          iconSizes[size],
        )}
      >
        <span className="relative z-10 -mt-0.5">a</span>
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
      </div>

      {/* Wordmark & Pill */}
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            'font-editorial font-bold tracking-tight text-zinc-900 dark:text-white',
            textSizes[size],
          )}
        >
          aurea
        </span>

        {showSubtitle && (
          <span
            className={clsx(
              'font-sans font-bold uppercase tracking-widest',
              'text-violet-700 dark:text-violet-300',
              'bg-violet-100/80 dark:bg-violet-950/60',
              'border border-violet-200 dark:border-violet-800/50 rounded-md',
              badgeSizes[size],
            )}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link to={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
