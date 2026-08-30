import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card rounded-2xl p-6 text-card-foreground',
          hoverEffect &&
            'hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-300/80 dark:hover:border-indigo-800/80 transition-all duration-200 cursor-pointer',
          glow && 'ring-1 ring-indigo-500/20 shadow-glow-indigo',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
