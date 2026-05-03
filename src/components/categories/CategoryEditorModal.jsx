import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { iconNames } from '@/components/shared/CategoryIcon';
import CategoryIcon from '@/components/shared/CategoryIcon';
import { cn } from '@/lib/utils';

const COLORS = [
  '#0078D4', '#107C10', '#C50F1F', '#8764B8', '#CA5010',
  '#008272', '#4F6BED', '#69797E', '#D83B01', '#E3008C',
  '#00B294', '#FFB900', '#744DA9', '#038387', '#0099BC',
];

const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export default function CategoryEditorModal({
  open, onClose, onSave,
  parentCategories,
  initialType = 'expense',
  editingCategory = null,
}) {
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [type, setType] = useState(initialType);
  const [icon, setIcon] = useState('tag');
  const [color, setColor] = useState(COLORS[0]);
  const [parentId, setParentId] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editingCategory;

  // Seed form when editing
  useEffect(() => {
    if (open) {
      if (editingCategory) {
        setName(editingCategory.name || '');
        setType(editingCategory.type || initialType);
        setIcon(editingCategory.icon || 'tag');
        setColor(editingCategory.color || COLORS[0]);
        setParentId(editingCategory.parent_id || '');
      } else {
        setName('');
        setType(initialType);
        setIcon('tag');
        setColor(randomColor());
        setParentId('');
      }
      // Auto-focus name
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [open, editingCategory, initialType]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      type,
      icon,
      color,
      parent_id: parentId || undefined,
    }, editingCategory?.id);
    setSaving(false);
    onClose();
  };

  const filteredParents = parentCategories.filter(c => c.type === type && !c.parent_id && c.id !== editingCategory?.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'New Category'}</DialogTitle>
        </DialogHeader>

        {/* Live Preview */}
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl mb-1">
          <CategoryIcon icon={icon} color={color} size="lg" />
          <div>
            <div className="text-sm font-semibold">{name || 'Category Name'}</div>
            <div className="text-xs text-muted-foreground capitalize">{type}</div>
          </div>
        </div>

        <div className="space-y-4 py-1">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
            <Input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Groceries"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {['income', 'expense', 'savings', 'debt'].map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setParentId(''); }}
                  className={cn(
                    "py-2 px-2 rounded-lg text-xs font-medium transition-all capitalize",
                    type === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-accent'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Parent */}
          {filteredParents.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Parent (optional)
              </label>
              <Select value={parentId || 'none'} onValueChange={v => setParentId(v === 'none' ? '' : v)}>
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

          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-7 h-7 rounded-lg transition-all",
                    color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Icon</label>
            <div className="grid grid-cols-8 gap-1 max-h-36 overflow-y-auto p-1 rounded-lg border border-border">
              {iconNames.map(n => (
                <button
                  key={n}
                  onClick={() => setIcon(n)}
                  className={cn(
                    "p-1 rounded-lg transition-all flex items-center justify-center",
                    icon === n ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-accent'
                  )}
                >
                  <CategoryIcon icon={n} color={icon === n ? color : '#999'} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}