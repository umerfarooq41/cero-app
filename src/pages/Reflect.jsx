import React, { useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  CreditCard,
  PiggyBank,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';

import MonthSelector from '@/components/shared/MonthSelector';
import {
  useAccounts,
  useAllTransactions,
  useBudgetSummary,
  useCategories,
  useCurrencyFormatter,
} from '@/hooks/useBudgetData';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  '#0078D4',
  '#107C10',
  '#C50F1F',
  '#8764B8',
  '#CA5010',
  '#008272',
  '#4F6BED',
  '#FFB900',
];

function Card({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'rounded-2xl border border-border bg-card shadow-sm',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

function SummaryCard({ title, value, subtitle, icon: Icon, tone = 'default' }) {
  const toneClass =
    tone === 'good'
      ? 'text-[hsl(var(--success))]'
      : tone === 'bad'
        ? 'text-destructive'
        : 'text-foreground';

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className={cn('text-xl font-bold tabular-nums', toneClass)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
}

function InsightCard({ icon: Icon, title, text, tone = 'default' }) {
  const iconClass =
    tone === 'good'
      ? 'text-[hsl(var(--success))]'
      : tone === 'bad'
        ? 'text-destructive'
        : tone === 'warning'
          ? 'text-amber-500'
          : 'text-primary';

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className={cn('w-4 h-4', iconClass)} />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            {text}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function Reflect() {
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), 'yyyy-MM')
  );

  const formatCurrency = useCurrencyFormatter();

  const { data: categories = [] } = useCategories();
  const { data: allTransactions = [] } = useAllTransactions();
  const { data: accounts = [] } = useAccounts();
  const budget = useBudgetSummary(currentMonth);

  const monthTransactions = budget.transactions || [];

  const income = Number(budget.totalIncome) || 0;
  const expenses = Number(budget.totalExpenses) || 0;
  const plannedExpenses = Number(budget.totalPlannedExpenses) || 0;
  const plannedIncome = Number(budget.totalPlannedIncome) || 0;
  const leftToAllocate = Number(budget.leftToAllocate) || 0;
  const netCashFlow = income - expenses;

  const netWorth = useMemo(() => {
    return accounts.reduce((sum, account) => {
      const balance = Number(account.balance) || 0;
      return sum + (account.category === 'asset' ? balance : -Math.abs(balance));
    }, 0);
  }, [accounts]);

  const totalAssets = useMemo(() => {
    return accounts
      .filter((account) => account.category === 'asset')
      .reduce((sum, account) => sum + (Number(account.balance) || 0), 0);
  }, [accounts]);

  const totalLiabilities = useMemo(() => {
    return accounts
      .filter((account) => account.category === 'liability')
      .reduce((sum, account) => sum + Math.abs(Number(account.balance) || 0), 0);
  }, [accounts]);

  const savingsRate = income > 0 ? Math.round((netCashFlow / income) * 100) : 0;

  const efficiency = useMemo(() => {
    if (plannedExpenses === 0) return 0;
    const ratio = expenses / plannedExpenses;
    if (ratio <= 1) return Math.round((1 - Math.abs(1 - ratio)) * 100);
    return Math.max(0, Math.round((1 - (ratio - 1)) * 100));
  }, [expenses, plannedExpenses]);

  const spendingBreakdown = useMemo(() => {
    const categorySpending = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const category = categories.find((c) => c.id === t.category_id);
        const name = category?.name || 'Uncategorized';
        categorySpending[name] = (categorySpending[name] || 0) + (Number(t.amount) || 0);
      });
    return Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [monthTransactions, categories]);

  const cashFlow = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(`${currentMonth}-01`), i);
      const month = format(monthDate, 'yyyy-MM');
      const label = format(monthDate, 'MMM');
      const txns = allTransactions.filter((t) => t.date?.startsWith(month));
      const monthIncome = txns.filter((t) => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      const monthExpenses = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);
      months.push({ month: label, income: monthIncome, expenses: monthExpenses, net: monthIncome - monthExpenses });
    }
    return months;
  }, [currentMonth, allTransactions]);

  const dailySpending = useMemo(() => {
    const days = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const day = t.date?.slice(8, 10) || '01';
        days[day] = (days[day] || 0) + (Number(t.amount) || 0);
      });
    return Object.entries(days)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([day, amount]) => ({ day, amount }));
  }, [monthTransactions]);

  const topCategory = spendingBreakdown[0];

  const insights = [
    {
      icon: netCashFlow >= 0 ? TrendingUp : TrendingDown,
      title: netCashFlow >= 0 ? 'Positive cash flow' : 'Negative cash flow',
      text: netCashFlow >= 0
        ? `You kept ${formatCurrency(netCashFlow)} after expenses this month.`
        : `You spent ${formatCurrency(Math.abs(netCashFlow))} more than your income this month.`,
      tone: netCashFlow >= 0 ? 'good' : 'bad',
    },
    {
      icon: Target,
      title: 'Budget efficiency',
      text: efficiency >= 80
        ? 'Strong control. Your spending is close to your planned budget.'
        : efficiency >= 50
          ? 'Some categories may need review before month end.'
          : 'Spending is far from plan. Review your largest categories.',
      tone: efficiency >= 80 ? 'good' : efficiency >= 50 ? 'warning' : 'bad',
    },
    {
      icon: topCategory ? CreditCard : Brain,
      title: topCategory ? `Largest spend: ${topCategory.name}` : 'No spending yet',
      text: topCategory
        ? `${topCategory.name} used ${formatCurrency(topCategory.value)} this month.`
        : 'Once you add expenses, your top spending categories will appear here.',
      tone: topCategory ? 'default' : 'good',
    },
    {
      icon: PiggyBank,
      title: 'Savings rate',
      text: income > 0
        ? `Your estimated savings rate is ${savingsRate}%.`
        : 'Add income transactions to calculate your savings rate.',
      tone: savingsRate >= 20 ? 'good' : savingsRate < 0 ? 'bad' : 'warning',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 lg:py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reflect</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Summary, trends, and useful insights
          </p>
        </div>
        <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <SummaryCard
          title="Income"
          value={formatCurrency(income)}
          subtitle={plannedIncome > 0 ? `${formatCurrency(plannedIncome)} planned` : 'No planned income'}
          icon={ArrowUpRight}
          tone="good"
        />
        <SummaryCard
          title="Expenses"
          value={formatCurrency(expenses)}
          subtitle={plannedExpenses > 0 ? `${formatCurrency(plannedExpenses)} planned` : 'No planned expenses'}
          icon={ArrowDownRight}
          tone={expenses > plannedExpenses && plannedExpenses > 0 ? 'bad' : 'default'}
        />
        <SummaryCard
          title="Net Cash Flow"
          value={formatCurrency(netCashFlow)}
          subtitle={savingsRate ? `${savingsRate}% savings rate` : 'This month'}
          icon={Wallet}
          tone={netCashFlow >= 0 ? 'good' : 'bad'}
        />
        <SummaryCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          subtitle={`${formatCurrency(totalAssets)} assets • ${formatCurrency(totalLiabilities)} debt`}
          icon={TrendingUp}
          tone={netWorth >= 0 ? 'good' : 'bad'}
        />
      </div>

      {/* Cash Flow + Efficiency */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4 mb-4">
        <Card className="p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Cash Flow — Last 6 Months
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Income, expenses, and monthly net</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="income" fill="#107C10" radius={[6, 6, 0, 0]} animationDuration={900} />
                <Bar dataKey="expenses" fill="#C50F1F" radius={[6, 6, 0, 0]} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Budget Efficiency
            </h3>
            <p className="text-xs text-muted-foreground mt-1">How closely spending follows your plan</p>
          </div>
          <div className="flex items-center justify-center py-3">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-40 h-40 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="3"
                />
                <motion.path
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${efficiency}, 100` }}
                  transition={{ duration: 1 }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={efficiency >= 70 ? '#107C10' : efficiency >= 40 ? '#FFB900' : '#C50F1F'}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{efficiency}%</span>
                <span className="text-xs text-muted-foreground">score</span>
              </div>
            </div>
          </div>
          <div className="text-center text-sm font-medium">
            {leftToAllocate === 0
              ? 'Every planned amount is allocated.'
              : leftToAllocate > 0
                ? `${formatCurrency(leftToAllocate)} still left to allocate.`
                : `${formatCurrency(Math.abs(leftToAllocate))} over-allocated.`}
          </div>
        </Card>
      </div>

      {/* Spending Breakdown + Daily Spending */}
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4 mb-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top Spending Categories</h3>
          {spendingBreakdown.length > 0 ? (
            <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-center gap-6">
              <div className="w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={900}
                    >
                      {spendingBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 w-full">
                {spendingBreakdown.map((category) => (
                  <div key={category.name} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: category.color }} />
                    <span className="text-sm flex-1 truncate">{category.name}</span>
                    <span className="text-sm font-medium tabular-nums">{formatCurrency(category.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-medium">No expense data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add expenses to see category breakdown.</p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Daily Spending This Month</h3>
          {dailySpending.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySpending}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0078D4"
                    fill="#0078D4"
                    fillOpacity={0.14}
                    strokeWidth={2}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm font-medium">No daily spending yet</p>
              <p className="text-xs text-muted-foreground mt-1">Expense transactions will appear here.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Smart Insights */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Smart Insights</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.title}
              icon={insight.icon}
              title={insight.title}
              text={insight.text}
              tone={insight.tone}
            />
          ))}
        </div>
      </div>
    </div>
  );
}