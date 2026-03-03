export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
