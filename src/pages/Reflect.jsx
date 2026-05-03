import React, { useState, useMemo } from 'react';
import { format, subMonths } from 'date-fns';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import MonthSelector from '@/components/shared/MonthSelector';
import { useCategories, useAllTransactions, useAccounts, useBudgetSummary, formatCurrency } from '@/hooks/useBudgetData';
import { cn } from '@/lib/utils';

const CHART_COLORS = ['#0078D4', '#107C10', '#C50F1F', '#8764B8', '#CA5010', '#008272', '#4F6BED', '#FFB900'];

export default function Reflect() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const { data: categories } = useCategories();
  const { data: allTransactions } = useAllTransactions();
  const { data: accounts } = useAccounts();
  const budget = useBudgetSummary(currentMonth);

  // Budget efficiency score
  const efficiency = useMemo(() => {
    if (budget.totalPlannedExpenses === 0) return 0;
    const ratio = budget.totalExpenses / budget.totalPlannedExpenses;
    if (ratio <= 1) return Math.round((1 - Math.abs(1 - ratio)) * 100);
    return Math.max(0, Math.round((1 - (ratio - 1)) * 100));
  }, [budget.totalExpenses, budget.totalPlannedExpenses]);

  // Top spending categories
  const spendingBreakdown = useMemo(() => {
    const catSpending = {};
    budget.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = categories.find(c => c.id === t.category_id);
        const name = cat?.name || 'Uncategorized';
        catSpending[name] = (catSpending[name] || 0) + (t.amount || 0);
      });
    return Object.entries(catSpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [budget.transactions, categories]);

  // Cash flow for last 6 months
  const cashFlow = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = format(subMonths(new Date(currentMonth + '-01'), i), 'yyyy-MM');
      const mLabel = format(subMonths(new Date(currentMonth + '-01'), i), 'MMM');
      const mTransactions = allTransactions.filter(t => t.date?.startsWith(m));
      const income = mTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
      const expenses = mTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
      months.push({ month: mLabel, income, expenses });
    }
    return months;
  }, [currentMonth, allTransactions]);

  // Net worth over time (simplified)
  const netWorth = accounts.reduce((s, a) => {
    return s + (a.category === 'asset' ? (a.balance || 0) : -(Math.abs(a.balance || 0)));
  }, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reflect</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Insights into your finances</p>
        </div>
        <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      </div>

      {/* Efficiency Card */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--secondary))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={efficiency >= 70 ? '#107C10' : efficiency >= 40 ? '#FFB900' : '#C50F1F'}
                strokeWidth="3"
                strokeDasharray={`${efficiency}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{efficiency}%</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Budget Efficiency
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {efficiency >= 80 ? "Excellent! You're staying well within your plan." :
               efficiency >= 50 ? "Good progress. A few areas need attention." :
               "Your spending has deviated significantly from the plan."}
            </p>
          </div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          Cash Flow — Last 6 Months
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="income" fill="#107C10" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#C50F1F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#107C10]" />
            Income
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#C50F1F]" />
            Expenses
          </div>
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold mb-4">Top Spending Categories</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {spendingBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2.5 w-full">
            {spendingBreakdown.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-sm flex-1 truncate">{cat.name}</span>
                <span className="text-sm font-medium tabular-nums">{formatCurrency(cat.value)}</span>
              </div>
            ))}
            {spendingBreakdown.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No expense data for this month</p>
            )}
          </div>
        </div>
      </div>

      {/* Net Worth */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Net Worth
          </h3>
          <span className={cn(
            "text-xl font-bold tabular-nums",
            netWorth >= 0 ? "text-[hsl(var(--success))]" : "text-destructive"
          )}>
            {netWorth < 0 ? '-' : ''}{formatCurrency(Math.abs(netWorth))}
          </span>
        </div>
      </div>
    </div>
  );
}