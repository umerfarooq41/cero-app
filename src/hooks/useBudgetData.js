import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

/* ---------------- MOCK DATA ---------------- */

const mockCategories = [
  { id: 1, name: "Salary", type: "income" },
  { id: 2, name: "Freelance", type: "income" },
  { id: 3, name: "Rent", type: "expense" },
  { id: 4, name: "Groceries", type: "expense" },
  { id: 5, name: "Savings", type: "savings" },
  { id: 6, name: "Loan", type: "debt" },
];

const mockTransactions = [
  { id: 1, category_id: 1, type: "income", amount: 5000, date: "2026-05-01" },
  { id: 2, category_id: 3, type: "expense", amount: 1500, date: "2026-05-02" },
  { id: 3, category_id: 4, type: "expense", amount: 300, date: "2026-05-03" },
];

const mockAllocations = [
  { id: 1, category_id: 3, planned_amount: 2000 },
  { id: 2, category_id: 4, planned_amount: 500 },
  { id: 3, category_id: 5, planned_amount: 800 },
  { id: 4, category_id: 6, planned_amount: 400 },
];

/* ---------------- HOOKS ---------------- */

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => mockCategories,
    initialData: [],
  });
}

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => [
      { id: 1, name: "Main Account", balance: 5000 },
    ],
    initialData: [],
  });
}

export function useTransactions(month) {
  return useQuery({
    queryKey: ['transactions', month],
    queryFn: async () => {
      if (!month) return mockTransactions;
      return mockTransactions.filter(t => t.date.startsWith(month));
    },
    initialData: [],
  });
}

export function useAllTransactions() {
  return useQuery({
    queryKey: ['all-transactions'],
    queryFn: async () => mockTransactions,
    initialData: [],
  });
}

export function useAllocations(month) {
  return useQuery({
    queryKey: ['allocations', month],
    queryFn: async () => mockAllocations,
    initialData: [],
  });
}

/* ---------------- SUMMARY LOGIC ---------------- */

export function useBudgetSummary(month) {
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions(month);
  const { data: allocations } = useAllocations(month);

  const getCategorySpent = (categoryId) => {
    return transactions
      .filter(t => t.category_id === categoryId)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
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

  const sumPlannedByType = (type) => {
    return categories
      .filter(c => c.type === type)
      .reduce((sum, c) => sum + getCategoryPlanned(c.id), 0);
  };

  const totalPlannedIncome = sumPlannedByType('income');
  const totalPlannedExpenses = sumPlannedByType('expense');
  const totalPlannedSavings = sumPlannedByType('savings');
  const totalPlannedDebt = sumPlannedByType('debt');

  const leftToAllocate =
    totalPlannedIncome -
    totalPlannedExpenses -
    totalPlannedSavings -
    totalPlannedDebt;

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

/* ---------------- UTIL ---------------- */

export function formatCurrency(amount) {
  return '$' + Math.abs(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}