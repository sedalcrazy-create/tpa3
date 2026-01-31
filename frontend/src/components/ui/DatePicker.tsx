import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import jalaali from 'jalaali-js';
import { getJalaaliMonthName } from '../../utils/jalali';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayJalaali = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const [viewYear, setViewYear] = useState(todayJalaali.jy);
  const [viewMonth, setViewMonth] = useState(todayJalaali.jm);

  useEffect(() => {
    if (value) {
      const parts = value.split('/').map(Number);
      if (parts.length === 3) {
        setViewYear(parts[0]);
        setViewMonth(parts[1]);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = viewMonth <= 6 ? 31 : viewMonth <= 11 ? 30 : jalaali.isLeapJalaaliYear(viewYear) ? 30 : 29;

  const firstDayGregorian = jalaali.toGregorian(viewYear, viewMonth, 1);
  const firstDayOfWeek = new Date(firstDayGregorian.gy, firstDayGregorian.gm - 1, firstDayGregorian.gd).getDay();
  // Saturday = 0 in Jalaali calendar grid
  const startOffset = (firstDayOfWeek + 1) % 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const selected = `${viewYear}/${String(viewMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
    onChange(selected);
    setOpen(false);
  };

  const toPersianNum = (n: number) => n.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);

  const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  return (
    <div ref={ref} className="relative">
      <div
        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        }`}
        onClick={() => !disabled && setOpen(!open)}
      >
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>
          {value ? toPersianNum(parseInt(value.split('/')[2])) + ' ' + getJalaaliMonthName(parseInt(value.split('/')[1])) + ' ' + toPersianNum(parseInt(value.split('/')[0])) : placeholder}
        </span>
      </div>

      {open && (
        <div className="absolute top-full mt-1 start-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72">
          <div className="flex items-center justify-between mb-3">
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            <span className="font-medium text-sm">
              {getJalaaliMonthName(viewMonth)} {toPersianNum(viewYear)}
            </span>
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-xs text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = `${viewYear}/${String(viewMonth).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === value;
              const isToday = viewYear === todayJalaali.jy && viewMonth === todayJalaali.jm && day === todayJalaali.jd;
              return (
                <button
                  key={i}
                  onClick={() => selectDay(day)}
                  className={`w-8 h-8 rounded-full text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary text-white'
                      : isToday
                      ? 'border border-primary text-primary'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {toPersianNum(day)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
