/**
 * Format a number as Nigerian Naira.
 * fmt(25000)     → "₦25,000"
 * fmt(1250000)   → "₦1,250,000"
 */
export const fmt = (amount) =>
  '₦' + Number(amount).toLocaleString('en-NG');
