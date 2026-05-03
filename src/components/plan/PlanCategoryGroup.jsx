import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import PlanCategoryRow from './PlanCategoryRow';
import { formatCurrency } from '@/hooks/useBudgetData';

export default function PlanCategoryGroup({ title, categories, subcategories, getCategorySpent, getCategoryPlanned }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const parentCategories = categories.filter(c => !c.parent_id);

  const totalSpent = parentCategories.reduce((sum, c) => {
    const subs = subcategories.filter(s => s.parent_id === c.id);
    if (subs.length > 0) {
      return sum + subs.reduce((s, sub) => s + getCategorySpent(sub.id), 0);
    }
    return sum + getCategorySpent(c.id);
  }, 0);

  const totalPlanned = parentCategories.reduce((sum, c) => {
    const subs = subcategories.filter(s => s.parent_id === c.id);
    if (subs.length > 0) {
      return sum + subs.reduce((s, sub) => s + getCategoryPlanned(sub.id), 0);
    }
    return sum + getCategoryPlanned(c.id);
  }, 0);

  if (parentCategories.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <div className="text-xs text-muted-foreground tabular-nums">
          {formatCurrency(totalSpent)} / {formatCurrency(totalPlanned)}
        </div>
      </div>
      <div className="divide-y divide-border/50">
        {parentCategories.map(cat => {
          const subs = subcategories.filter(s => s.parent_id === cat.id);
          const isOpen = expanded[cat.id];
          const catSpent = subs.length > 0
            ? subs.reduce((s, sub) => s + getCategorySpent(sub.id), 0)
            : getCategorySpent(cat.id);
          const catPlanned = subs.length > 0
            ? subs.reduce((s, sub) => s + getCategoryPlanned(sub.id), 0)
            : getCategoryPlanned(cat.id);

          return (
            <div key={cat.id}>
              <button 
                onClick={() => subs.length > 0 && toggle(cat.id)}
                className="w-full text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <PlanCategoryRow 
                      category={cat} 
                      spent={catSpent} 
                      planned={catPlanned} 
                    />
                  </div>
                  {subs.length > 0 && (
                    <ChevronDown className={cn(
                      "w-4 h-4 mr-4 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )} />
                  )}
                </div>
              </button>
              {isOpen && subs.map(sub => (
                <PlanCategoryRow 
                  key={sub.id}
                  category={sub}
                  spent={getCategorySpent(sub.id)}
                  planned={getCategoryPlanned(sub.id)}
                  isSubcategory
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}