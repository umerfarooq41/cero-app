import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useCategories, useAccounts } from '@/hooks/useBudgetData';
import { cn } from '@/lib/utils';
import CategoryIcon from '@/components/shared/CategoryIcon';

const typeOptions = [
  { value: 'expense', label: 'Expense', icon: ArrowUpRight, color: 'border-destructive bg-destructive/10 text-destructive' },
  { value: 'income', label: 'Income', icon: ArrowDownLeft, color: 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' },
  { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'border-primary bg-primary/10 text-primary' },
];

export default function AddTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter(c => {
    if (type === 'expense') return c.type === 'expense' || c.type === 'savings' || c.type === 'debt';
    if (type === 'income') return c.type === 'income';
    return false;
  });

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setSaving(true);
    
    const data = {
      amount: parseFloat(amount),
      type,
      date,
      note: note || undefined,
      category_id: type !== 'transfer' ? categoryId || undefined : undefined,
      account_id: accountId || undefined,
      to_account_id: type === 'transfer' ? toAccountId || undefined : undefined,
    };

    await base44.entities.Transaction.create(data);

    // Update account balances
    if (accountId) {
      const acc = accounts.find(a => a.id === accountId);
      if (acc) {
        const delta = type === 'income' ? parseFloat(amount) : -parseFloat(amount);
        await base44.entities.Account.update(accountId, { balance: (acc.balance || 0) + delta });
      }
    }
    if (type === 'transfer' && toAccountId) {
      const acc = accounts.find(a => a.id === toAccountId);
      if (acc) {
        await base44.entities.Account.update(toAccountId, { balance: (acc.balance || 0) + parseFloat(amount) });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    setSaving(false);
    toast.success('Transaction added');
    navigate('/transactions');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 lg:py-10">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Add Transaction</h1>
      </div>

      {/* Amount Input */}
      <div className="bg-card rounded-2xl border border-border p-8 mb-6 text-center">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Amount</div>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-light text-muted-foreground">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-5xl font-bold bg-transparent border-none outline-none text-center w-48 tabular-nums"
            step="0.01"
            min="0"
            autoFocus
          />
        </div>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {typeOptions.map(opt => {
          const isActive = type === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-sm font-medium",
                isActive ? opt.color : "border-border text-muted-foreground hover:border-muted-foreground/30"
              )}
            >
              <opt.icon className="w-5 h-5" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Details */}
      <div className="space-y-4 bg-card rounded-xl border border-border p-5">
        {type !== 'transfer' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color || '#0078D4' }} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === 'transfer' && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">To Account</label>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
              <SelectContent>
                {accounts.filter(a => a.id !== accountId).map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Note</label>
          <Textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            className="h-20 resize-none"
          />
        </div>
      </div>

      <Button 
        onClick={handleSubmit}
        disabled={saving || !amount}
        className="w-full h-12 mt-6 text-sm font-semibold"
      >
        {saving ? 'Saving...' : 'Add Transaction'}
      </Button>
    </div>
  );
}