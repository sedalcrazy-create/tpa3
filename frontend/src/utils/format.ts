import { toJalaali } from './jalali';

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

export function toPersianNumber(n: number | string): string {
  return String(n).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function formatNumber(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '-';
  return toPersianNumber(num.toLocaleString('en-US'));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '-';
  return formatNumber(num) + ' ریال';
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return toPersianNumber(toJalaali(dateStr));
}
