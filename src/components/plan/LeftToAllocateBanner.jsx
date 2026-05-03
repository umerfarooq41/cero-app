import React from 'react';
import { Check, AlertTriangle, CircleDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/hooks/useBudgetData';

export default function LeftToAllocateBanner({ leftToAllocate, totalIncome, isEditMode }) {
  const isZero = Math.abs(leftToAllocate) < 0.01;
  const isOver = leftToAllocate < 0;
  const isUnder = leftToAllocate > 0;

  const stateColor = isZero
    ? 'text-[hsl(var(--success))]'
    : isOver
    ? 'text-destructive'
    : 'text-primary';

  const bgColor = isZero
    ? 'bg-[hsl(var(--success)/0.08)] border-[hsl(var(--success)/0.2)]'
    : isOver
    ? 'bg-destructive/5 border-destructive/20'
    : 'bg-primary/5 border-primary/20';

  const feedbackText = isZero
    ? 'All money assigned ✓'
    : isOver
    ? `Over-allocated by ${formatCurrency(Math.abs(leftToAllocate))}`
    : `${formatCurrency(leftToAllocate)} left to allocate`;

  return (
    <div className={cn(
      "sticky top-0 z-20 bg-card/95 backdrop-blur-xl border rounded-xl p-4 shadow-sm transition-all duration-300",
      isEditMode ? bgColor : 'border-border'
    )}>
      <div className="flex items-center justify-between gap-4">
        {/* Total Income */}
        <div className="space-y-0.5 min-w-0">
          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">Income</div>
          <div className="text-base font-bold tabular-nums">{formatCurrency(totalIncome)}</div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* Left to Allocate — center */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-0.5">Left to Allocate</div>
          <div className={cn("text-2xl font-bold tabular-nums tracking-tight", stateColor)}>
            {isOver ? '-' : ''}{formatCurrency(Math.abs(leftToAllocate))}
          </div>
          {isEditMode && (
            <div className={cn("text-[11px] font-medium mt-0.5", stateColor)}>
              {feedbackText}
            </div>
          )}
        </div>

        {/* Status icon */}
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          isZero ? 'bg-[hsl(var(--success)/0.15)]' : isOver ? 'bg-destructive/10' : 'bg-primary/10'
        )}>
          {isZero && <Check className={cn("w-4 h-4", stateColor)} />}
          {isOver && <AlertTriangle className={cn("w-4 h-4", stateColor)} />}
          {isUnder && <CircleDollarSign className={cn("w-4 h-4", stateColor)} />}
        </div>
      </div>
    </div>
  );
}