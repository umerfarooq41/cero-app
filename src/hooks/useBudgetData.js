import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.filter({ is_archived: false }),
    initialData: [],
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => base44.entities.Account.filter({ is_archived: false }),
    initialData: [],
  });
}

export function useTransactions(month) {
  return useQuery({
    queryKey: ['transactions', month],
    queryFn: async () => {
      const all = await base44.entities.Transaction.list('-date', 500);
      if (!month) return all;
      return all.filter(t => t.date?.startsWith(month));
    },
    initialData: [],
  });
}

export function useAllTransactions() {
  return useQuery({
    queryKey: ['all-transactions'],
    queryFn: () => base44.entities.Transaction.list('-date', 1000),
    initialData: [],
  });
}

export function useAllocations(month) {
  return useQuery({
    queryKey: ['allocations', month],
    queryFn: () => base44.entities.BudgetAllocation.filter({ month }),
    initialData: [],
  });
}

export function useBudgetSummary(month) {
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions(month);
  const { data: allocations } = useAllocations(month);

  const getCategorySpent = (categoryId) => {
    return transactions
      .filter(t => t.category_id === categoryId)
      .reduce((sum, t) => {
        if (t.type === 'income') return sum + (t.amount || 0);
        return sum + (t.amount || 0);
      }, 0);
  };

  const getCategoryPlanned = (categoryId) => {
    const alloc = allocations.find(a => a.category_id === categoryId);
    return alloc?.planned_amount || 0;
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalPlannedIncome = categories
    .filter(c => c.type === 'income' && !c.parent_id)
    .reduce((sum, c) => {
      const subs = categories.filter(s => s.parent_id === c.id);
      if (subs.length > 0) {
        return sum + subs.reduce((s, sub) => s + getCategoryPlanned(sub.id), 0);
      }
      return sum + getCategoryPlanned(c.id);
    }, 0);

  const totalPlannedExpenses = categories
    .filter(c => c.type === 'expense' && !c.parent_id)
    .reduce((sum, c) => {
      const subs = categories.filter(s => s.parent_id === c.id);
      if (subs.length > 0) {
        return sum + subs.reduce((s, sub) => s + getCategoryPlanned(sub.id), 0);
      }
      return sum + getCategoryPlanned(c.id);
    }, 0);

  const totalPlannedSavings = categories
    .filter(c => c.type === 'savings' && !c.parent_id)
    .reduce((sum, c) => {
      const subs = categories.filter(s => s.parent_id === c.id);
      if (subs.length > 0) {
        return sum + subs.reduce((s, sub) => s + getCategoryPlanned(sub.id), 0);
      }
      return sum + getCategoryPlanned(c.id);
    }, 0);

  const totalPlannedDebt = categories
    .filter(c => c.type === 'debt' && !c.parent_id)
    .reduce((sum, c) => {
      const subs = categories.filter(s => s.parent_id === c.id);
      if (subs.length > 0) {
        return sum + subs.reduce((s, sub) => s + getCategoryPlanned(sub.id), 0);
      }
      return sum + getCategoryPlanned(c.id);
    }, 0);

  const leftToAllocate = totalPlannedIncome - totalPlannedExpenses - totalPlannedSavings - totalPlannedDebt;

  return {
    categories,
    transactions,
    allocations,
    getCategorySpent,
    getCategoryPlanned,
    totalIncome,
    totalExpenses,
    totalPlannedIncome,
    totalPlannedExpenses,
    totalPlannedSavings,
    totalPlannedDebt,
    leftToAllocate,
  };
}

export function formatCurrency(amount, symbol = '$') {
  return symbol + Math.abs(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export { useCurrencyFormatter } from '@/hooks/useCurrency';