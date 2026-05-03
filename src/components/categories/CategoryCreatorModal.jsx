import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iconNames } from '@/components/shared/CategoryIcon';
import CategoryIcon from '@/components/shared/CategoryIcon';

const colors = [
  '#0078D4', '#107C10', '#C50F1F', '#8764B8', '#CA5010', 
  '#008272', '#4F6BED', '#69797E', '#D83B01', '#E3008C',
  '#00B294', '#4A154B', '#FFB900', '#744DA9', '#038387'
];

export default function CategoryCreatorModal({ open, onClose, onSave, parentCategories, initialType }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(initialType || 'expense');
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState(colors[0]);
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    await onSave({ name, type, icon, color, parent_id: parentId || undefined });
    setSaving(false);
    setName(''); setIcon('tag'); setColor(colors[0]); setParentId('');
    onClose();
  };

  const filteredParents = parentCategories.filter(c => c.type === type && !c.parent_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
                <SelectItem value="debt">Debt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredParents.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Parent (optional)</label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {filteredParents.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Icon</label>
            <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-1">
              {iconNames.map(name => (
                <button
                  key={name}
                  onClick={() => setIcon(name)}
                  className={`p-1.5 rounded-lg transition-all ${
                    icon === name ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-accent'
                  }`}
                >
                  <CategoryIcon icon={name} color={icon === name ? color : '#888'} size="sm" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}