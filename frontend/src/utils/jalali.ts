import jalaali from 'jalaali-js';

export function toJalaali(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  } catch {
    return dateStr;
  }
}

export function toGregorian(jDateStr: string): string {
  if (!jDateStr) return '';
  try {
    const parts = jDateStr.split('/').map(Number);
    if (parts.length !== 3) return jDateStr;
    const { gy, gm, gd } = jalaali.toGregorian(parts[0], parts[1], parts[2]);
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  } catch {
    return jDateStr;
  }
}

export function getCurrentJalaaliDate(): string {
  const now = new Date();
  const { jy, jm, jd } = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

export function getJalaaliMonthName(month: number): string {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ];
  return months[month - 1] || '';
}

export function isValidJalaaliDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const parts = dateStr.split('/').map(Number);
  if (parts.length !== 3) return false;
  const [jy, jm, jd] = parts;
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return false;
  if (jm > 6 && jd > 30) return false;
  if (jm === 12 && jd > 29 && !jalaali.isLeapJalaaliYear(jy)) return false;
  return true;
}
