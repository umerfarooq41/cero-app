import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Building, Landmark, CreditCard, Banknote, PiggyBank, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccounts, formatCurrency } from '@/hooks/useBudgetData';
import { cn } from '@/lib/utils';

const typeIcons = {
  checking: Landmark, savings: PiggyBank, credit_card: CreditCard,
  cash: Banknote, investment: TrendingUp, loan: Building, other: Wallet,
};

export default function Accounts() {
  const { data: accounts } = useAccounts();

  const assets = accounts.filter(a => a.category === 'asset');
  const liabilities = accounts.filter(a => a.category === 'liability');
  const totalAssets = assets.reduce((s, a) => s + (a.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const renderGroup = (title, accs, isLiability) => {
    if (accs.length === 0) return null;
    const total = accs.reduce((s, a) => s + Math.abs(a.balance || 0), 0);

    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
        <div className="divide-y divide-border/50">
          {accs.map(acc => {
            const Icon = typeIcons[acc.type] || Wallet;
            return (
              <Link 
                key={acc.id} 
                to={`/accounts/${acc.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors"
              >
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: (acc.color || '#0078D4') + '18' }}
                >
                  <Icon className="w-4 h-4" style={{ color: acc.color || '#0078D4' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{acc.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{acc.type?.replace('_', ' ')}</div>
                </div>
                <span className={cn(
                  "text-sm font-semibold tabular-nums",
                  isLiability ? "text-destructive" : "text-foreground"
                )}>
                  {isLiability ? '-' : ''}{formatCurrency(Math.abs(acc.balance || 0))}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your financial overview</p>
      </div>

      {/* Net Worth Hero */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-8 text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Net Worth</div>
        <div className={cn(
          "text-4xl font-bold tracking-tight mb-3",
          netWorth >= 0 ? "text-foreground" : "text-destructive"
        )}>
          {netWorth < 0 ? '-' : ''}{formatCurrency(Math.abs(netWorth))}
        </div>
        <div className="text-xs text-muted-foreground">
          Assets {formatCurrency(totalAssets)} − Liabilities {formatCurrency(totalLiabilities)}
        </div>
      </div>

      <div className="space-y-4">
        {renderGroup('Assets', assets, false)}
        {renderGroup('Liabilities', liabilities, true)}
      </div>

      <Link to="/add-account">
        <Button 
          className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-lg shadow-primary/25 p-0"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}