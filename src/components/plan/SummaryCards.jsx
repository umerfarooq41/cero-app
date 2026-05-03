import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/hooks/useBudgetData';

function SummaryCard({ label, icon: Icon, amount = 0, planned = 0, type, faded }) {
  // ✅ Prevent undefined / NaN issues
  const safeAmount = Number(amount) || 0;
  const safePlanned = Number(planned) || 0;

  // ✅ Fixed percentage logic
  const percentage =
    type === 'income'
      ? 100
      : safePlanned > 0
        ? Math.min((safeAmount / safePlanned) * 100, 100)
        : 0;

  const isOver = safeAmount > safePlanned && safePlanned > 0;

  const colorMap = {
    income: { bar: 'bg-[hsl(var(--success))]', text: 'text-[hsl(var(--success))]' },
    expense: { bar: isOver ? 'bg-destructive' : 'bg-primary', text: isOver ? 'text-destructive' : 'text-primary' },
    savings: { bar: 'bg-chart-4', text: 'text-chart-4' },
    debt: { bar: 'bg-chart-3', text: 'text-chart-3' },
  };

  const colors = colorMap[type] || colorMap.expense;

  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-4 transition-all duration-300",
        faded && "opacity-50 scale-[0.98]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Amount */}
      <div className={cn("text-xl font-bold tabular-nums mb-2", colors.text)}>
        {formatCurrency(safeAmount)}
      </div>

      {/* ✅ Always show for income OR when planned exists */}
      {(safePlanned > 0 || type === 'income') && (
        <>
          {/* Progress bar */}
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-1.5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                colors.bar
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Label */}
          <div className="text-[11px] text-muted-foreground tabular-nums">
            {type === 'income'
              ? 'Total income'
              : `${Math.round(percentage)}% of ${formatCurrency(safePlanned)}`}
          </div>
        </>
      )}
    </div>
  );
}

export default function SummaryCards({ budget, savingsSpent = 0, debtSpent = 0, isEditMode }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3 transition-all duration-300",
        isEditMode && "mb-2"
      )}
    >
      <SummaryCard
        label="Income"
        icon={TrendingUp}
        type="income"
        amount={budget?.totalIncome}
        planned={budget?.totalPlannedIncome}
        faded={isEditMode}
      />

      <SummaryCard
        label="Expenses"
        icon={TrendingDown}
        type="expense"
        amount={budget?.totalExpenses}
        planned={budget?.totalPlannedExpenses}
        faded={isEditMode}
      />

      <SummaryCard
        label="Savings"
        icon={PiggyBank}
        type="savings"
        amount={savingsSpent}
        planned={budget?.totalPlannedSavings}
        faded={isEditMode}
      />

      <SummaryCard
        label="Debt"
        icon={CreditCard}
        type="debt"
        amount={debtSpent}
        planned={budget?.totalPlannedDebt}
        faded={isEditMode}
      />
    </div>
  );
}