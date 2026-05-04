import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useCurrency() {
  const { data: symbol = '$' } = useQuery({
    queryKey: ['currency-symbol'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return user?.app_settings?.currency || '$';
    },
    staleTime: 0,
  });
  return symbol;
}

export function useCurrencyFormatter() {
  const symbol = useCurrency();
  return (amount) => formatCurrency(amount, symbol);
}

export function formatCurrency(amount, symbol = '$') {
  return symbol + Math.abs(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}