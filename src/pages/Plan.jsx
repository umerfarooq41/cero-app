import React, { useState, useEffect, useCallback } from 'react';
import { format, subMonths } from 'date-fns';
import { PencilLine, Copy, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import MonthSelector from '@/components/shared/MonthSelector';
import LeftToAllocateBanner from '@/components/plan/LeftToAllocateBanner';
import SummaryCards from '@/components/plan/SummaryCards';
import UnifiedCategorySection from '@/components/plan/UnifiedCategorySection';
import {
  useBudgetSummary,
  useCategories,
  formatCurrency,
} from '@/hooks/useBudgetData';

export default function Plan() {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isEditMode, setIsEditMode] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [saving, setSaving] = useState(false);

  const budget = useBudgetSummary(currentMonth);
  const { data: categories } = useCategories();

  const prevMonth = format(subMonths(new Date(currentMonth + '-01'), 1), 'yyyy-MM');

  // ✅ LOAD SAVED DATA WHEN MONTH CHANGES
  useEffect(() => {
    const saved = localStorage.getItem(`cero_allocations_${currentMonth}`);
    if (saved) {
      setEditValues(JSON.parse(saved));
    } else {
      setEditValues({});
    }
  }, [currentMonth]);

  // ✅ ENTER EDIT MODE
  const enterEditMode = useCallback(() => {
    const saved = localStorage.getItem(`cero_allocations_${currentMonth}`);

    if (saved) {
      setEditValues(JSON.parse(saved));
    } else {
      const initial = {};
      categories.forEach(c => {
        initial[c.id] = 0;
      });
      setEditValues(initial);
    }

    setIsEditMode(true);
  }, [categories, currentMonth]);

  const cancelEdit = () => {
    setIsEditMode(false);
  };

  // ✅ AUTO SAVE ON CHANGE
  const onEditChange = useCallback((catId, value) => {
    setEditValues(prev => {
      const updated = { ...prev, [catId]: value };

      localStorage.setItem(
        `cero_allocations_${currentMonth}`,
        JSON.stringify(updated)
      );

      return updated;
    });
  }, [currentMonth]);

  // ✅ MANUAL SAVE (JUST UX)
  const handleSave = () => {
    setSaving(true);

    localStorage.setItem(
      `cero_allocations_${currentMonth}`,
      JSON.stringify(editValues)
    );

    setTimeout(() => {
      setSaving(false);
      setIsEditMode(false);
      toast.success('Plan saved');
    }, 300);
  };

  // ✅ COPY FROM PREVIOUS MONTH
  const copyFromPrev = () => {
    const prev = localStorage.getItem(`cero_allocations_${prevMonth}`);
    if (!prev) {
      toast.error('No data from previous month');
      return;
    }

    const parsed = JSON.parse(prev);
    setEditValues(parsed);

    localStorage.setItem(
      `cero_allocations_${currentMonth}`,
      JSON.stringify(parsed)
    );

    toast.success('Copied from last month');
  };

  // 💡 CALCULATIONS
  const sumEditType = (type) => {
    return categories
      .filter(c => c.type === type)
      .reduce((sum, c) => sum + (editValues[c.id] || 0), 0);
  };

  const editTotalIncome = isEditMode ? sumEditType('income') : budget.totalPlannedIncome;
  const editTotalExpenses = isEditMode ? sumEditType('expense') : 0;
  const editTotalSavings = isEditMode ? sumEditType('savings') : 0;
  const editTotalDebt = isEditMode ? sumEditType('debt') : 0;

  const leftToAllocate = isEditMode
    ? editTotalIncome - editTotalExpenses - editTotalSavings - editTotalDebt
    : budget.leftToAllocate;

  const totalIncomeDisplay = isEditMode ? editTotalIncome : budget.totalIncome;

  // categories split
  const allSubs = categories.filter(c => c.parent_id);
  const incomeCategories = categories.filter(c => c.type === 'income' && !c.parent_id);
  const expenseCategories = categories.filter(c => c.type === 'expense' && !c.parent_id);
  const savingsCategories = categories.filter(c => c.type === 'savings' && !c.parent_id);
  const debtCategories = categories.filter(c => c.type === 'debt' && !c.parent_id);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-28">

      {/* HEADER */}
      <div className="sticky top-0 z-30 pt-6 pb-2 bg-background/95 backdrop-blur-sm">
        <AnimatePresence mode="wait">
          {isEditMode ? (
            <motion.div key="edit-header" className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="w-4 h-4" /> Cancel
              </Button>

              <h1 className="text-base font-semibold">Edit Plan</h1>

              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </motion.div>
          ) : (
            <motion.div key="read-header" className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">Plan</h1>
              </div>

              <div className="flex gap-2">
                <MonthSelector currentMonth={currentMonth} onChange={setCurrentMonth} />

                <Button variant="ghost" size="icon" onClick={enterEditMode}>
                  <PencilLine className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BODY */}
      <div className="space-y-4 pt-4">

        <LeftToAllocateBanner
          leftToAllocate={leftToAllocate}
          totalIncome={totalIncomeDisplay}
          isEditMode={isEditMode}
        />

        {isEditMode && (
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={copyFromPrev}>
              <Copy className="w-4 h-4" /> Copy last month
            </Button>
          </div>
        )}

        <SummaryCards budget={budget} isEditMode={isEditMode} />

        <UnifiedCategorySection
          title="Income"
          categories={incomeCategories}
          subcategories={allSubs}
          isEditMode={isEditMode}
          getCategorySpent={budget.getCategorySpent}
          getCategoryPlanned={() => 0}
          editValues={editValues}
          onEditChange={onEditChange}
          prevValues={{}}
        />

        <UnifiedCategorySection
          title="Expenses"
          categories={expenseCategories}
          subcategories={allSubs}
          isEditMode={isEditMode}
          getCategorySpent={budget.getCategorySpent}
          getCategoryPlanned={() => 0}
          editValues={editValues}
          onEditChange={onEditChange}
          prevValues={{}}
        />

        <UnifiedCategorySection
          title="Savings"
          categories={savingsCategories}
          subcategories={allSubs}
          isEditMode={isEditMode}
          getCategorySpent={budget.getCategorySpent}
          getCategoryPlanned={() => 0}
          editValues={editValues}
          onEditChange={onEditChange}
          prevValues={{}}
        />

        <UnifiedCategorySection
          title="Debt"
          categories={debtCategories}
          subcategories={allSubs}
          isEditMode={isEditMode}
          getCategorySpent={budget.getCategorySpent}
          getCategoryPlanned={() => 0}
          editValues={editValues}
          onEditChange={onEditChange}
          prevValues={{}}
        />

      </div>
    </div>
  );
}