import React, { useState, useEffect } from 'react';
import { Moon, Sun, Laptop, Globe, Calculator, Download, Trash2, ChevronRight, AlignLeft, AlignRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useTheme } from '@/components/theme-provider';
import Logo from '@/components/Logo';

// Currencies
const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'SAR', label: 'Saudi Riyal', symbol: 'SAR', icon: '/sar.svg' },
  { code: 'PKR', label: 'Pakistani Rupee', symbol: 'Rs' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    currency: 'SAR',
    symbolPlacement: 'prefix',
    numberFormat: 'comma',
    dateFormat: 'DD/MM/YYYY',
    shift25th: false,
    autoSweep: false,
  });

  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cero_settings');
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('cero_settings', JSON.stringify(updated));
  };

  const Row = ({ icon: Icon, title, subtitle, right, onClick, customIcon }) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between gap-4 px-4 py-4 
      active:bg-accent/50 hover:bg-accent/30 transition-all duration-200"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-9 h-9 shrink-0 rounded-lg bg-muted/70 backdrop-blur flex items-center justify-center">
          {customIcon ? (
            <img src={customIcon} alt="" className="w-5 h-5 object-contain" />
          ) : (
            <Icon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="text-[14px] font-medium truncate">{title}</div>
          {subtitle && (
            <div className="text-[12px] text-muted-foreground leading-tight">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {right}
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      </div>
    </div>
  );

  const selectedCurrency = CURRENCIES.find(c => c.code === settings.currency);

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-8 fade-in">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-1">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
          <Logo size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Customize your experience
          </p>
        </div>
      </div>

      {/* APPEARANCE */}
      <Section title="Appearance">
        <Row
          icon={theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop}
          title="Theme"
          subtitle="Switch between light and dark modes"
          right={
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="h-9 w-[110px] bg-muted/50 border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </Section>

      {/* REGIONAL */}
      <Section title="Regional & Localization">
        <Row
          icon={Globe}
          customIcon={selectedCurrency?.icon}
          title="Currency"
          right={
            <Select value={settings.currency} onValueChange={(v) => updateSetting('currency', v)}>
              <SelectTrigger className="h-9 w-[130px] bg-muted/50 border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        <Row
          icon={settings.symbolPlacement === 'prefix' ? AlignLeft : AlignRight}
          title="Symbol Position"
          subtitle={settings.symbolPlacement === 'prefix' ? "$ 100.00" : "100.00 $"}
          right={
            <Switch
              checked={settings.symbolPlacement === 'suffix'}
              onCheckedChange={(v) =>
                updateSetting('symbolPlacement', v ? 'suffix' : 'prefix')
              }
            />
          }
        />

        <Row
          icon={Globe}
          title="Number Format"
          right={
            <Select value={settings.numberFormat} onValueChange={(v) => updateSetting('numberFormat', v)}>
              <SelectTrigger className="h-9 w-[110px] bg-muted/50 border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comma">1,234.56</SelectItem>
                <SelectItem value="period">1.234,56</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <Row
          icon={Globe}
          title="Date Format"
          right={
            <Select value={settings.dateFormat} onValueChange={(v) => updateSetting('dateFormat', v)}>
              <SelectTrigger className="h-9 w-[130px] bg-muted/50 border-none shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </Section>

      {/* BUDGET */}
      <Section title="Budget Logic">
        <Row
          icon={Calculator}
          title="25th Rule"
          subtitle="Income after 25th moves to next month"
          right={
            <Switch
              checked={settings.shift25th}
              onCheckedChange={(v) => updateSetting('shift25th', v)}
            />
          }
        />

        <Row
          icon={Calculator}
          title="Auto-Sweep Surplus"
          subtitle="Unused funds transfer to savings"
          right={
            <Switch
              checked={settings.autoSweep}
              onCheckedChange={(v) => updateSetting('autoSweep', v)}
            />
          }
        />
      </Section>

      {/* DANGER */}
      <Section title="Danger Zone" danger>
        <Row
          icon={Download}
          title="Export Data"
          subtitle="Download your history as CSV"
          right={<Button size="sm" variant="outline">Export</Button>}
        />

        <Row
          icon={Trash2}
          title="Factory Reset"
          subtitle="Wipe all data"
          right={
            <Button size="sm" variant="destructive" onClick={() => setShowResetDialog(true)}>
              Reset
            </Button>
          }
        />
      </Section>

      {/* DIALOG */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-[90%] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete your data.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-row gap-2">
            <Button className="flex-1" variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => {
                localStorage.clear();
                toast.success('System reset successfully');
                window.location.reload();
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* SECTION COMPONENT */
function Section({ title, children, danger }) {
  return (
    <div className="space-y-2">
      <div className={`px-1 text-[11px] font-bold tracking-wider uppercase ${
        danger ? 'text-destructive' : 'text-muted-foreground'
      }`}>
        {title}
      </div>

      <div className="rounded-2xl overflow-hidden border bg-card card-elevated divide-y">
        {children}
      </div>
    </div>
  );
}