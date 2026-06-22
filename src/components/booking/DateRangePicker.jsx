// src/components/booking/DateRangePicker.jsx
import { useState, useRef, useEffect, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { isDateBooked } from '../../utils/booking.js';

/**
 * DateRangePicker — calendar picker for pickup/return dates.
 * Highlights booked dates, validates min pickup (now + 1h).
 */
export default function DateRangePicker({
  pickupDate,
  returnDate,
  onPickupChange,
  onReturnChange,
  bookedRanges = [],
  pickupTime = '07:00',
  returnTime = '07:00',
  onPickupTimeChange,
  onReturnTimeChange,
}) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState('pickup'); // 'pickup' | 'return'
  const [viewMonth, setViewMonth] = useState(dayjs().startOf('month'));
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const today = dayjs().startOf('day');
  const minPickup = dayjs().add(1, 'hour').startOf('day');

  const daysInMonth = useMemo(() => {
    const start = viewMonth.startOf('month');
    const end = viewMonth.endOf('month');
    const startDay = start.day(); // 0=Sun
    const days = [];

    // Blanks before 1st
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = start; d.isBefore(end) || d.isSame(end, 'day'); d = d.add(1, 'day')) {
      days.push(d);
    }
    return days;
  }, [viewMonth]);

  const handleDateClick = (date) => {
    if (!date) return;
    const isPast = date.isBefore(minPickup);
    const booked = isDateBooked(date.toDate(), bookedRanges);
    if (isPast || booked) return;

    if (selecting === 'pickup') {
      onPickupChange(date.format('YYYY-MM-DD'));
      setSelecting('return');
      // If return is before new pickup, reset it
      if (returnDate && dayjs(returnDate).isBefore(date)) {
        onReturnChange(date.add(1, 'day').format('YYYY-MM-DD'));
      }
    } else {
      if (date.isBefore(dayjs(pickupDate))) {
        // If clicked date is before pickup, treat as new pickup
        onPickupChange(date.format('YYYY-MM-DD'));
        setSelecting('return');
      } else {
        onReturnChange(date.format('YYYY-MM-DD'));
        setOpen(false);
        setSelecting('pickup');
      }
    }
  };

  const isInRange = (date) => {
    if (!date || !pickupDate || !returnDate) return false;
    return date.isAfter(dayjs(pickupDate)) && date.isBefore(dayjs(returnDate));
  };

  const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const TIME_OPTIONS = [];
  for (let h = 0; h < 24; h++) {
    for (const m of ['00', '30']) {
      TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${m}`);
    }
  }

  return (
    <div ref={ref} className="relative">
      {/* Date inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-medium text-ink-500 mb-1 block">Ngày nhận</label>
          <button
            type="button"
            onClick={() => { setSelecting('pickup'); setOpen(true); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition ${
              selecting === 'pickup' && open
                ? 'border-brand-primary ring-2 ring-brand-primary/20'
                : 'border-ink-100 hover:border-ink-300'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-ink-400 flex-shrink-0" />
            <span className={pickupDate ? 'text-ink-900 font-medium' : 'text-ink-300'}>
              {pickupDate ? dayjs(pickupDate).format('DD/MM/YYYY') : 'Chọn ngày'}
            </span>
          </button>
        </div>
        <div>
          <label className="text-[11px] font-medium text-ink-500 mb-1 block">Ngày trả</label>
          <button
            type="button"
            onClick={() => { setSelecting('return'); setOpen(true); }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition ${
              selecting === 'return' && open
                ? 'border-brand-primary ring-2 ring-brand-primary/20'
                : 'border-ink-100 hover:border-ink-300'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-ink-400 flex-shrink-0" />
            <span className={returnDate ? 'text-ink-900 font-medium' : 'text-ink-300'}>
              {returnDate ? dayjs(returnDate).format('DD/MM/YYYY') : 'Chọn ngày'}
            </span>
          </button>
        </div>
      </div>

      {/* Time selectors */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <label className="text-[11px] font-medium text-ink-500 mb-1 block">Giờ nhận</label>
          <select
            value={pickupTime}
            onChange={(e) => onPickupTimeChange?.(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ink-100 text-sm text-ink-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={`p-${t}`} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-ink-500 mb-1 block">Giờ trả</label>
          <select
            value={returnTime}
            onChange={(e) => onReturnTimeChange?.(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-ink-100 text-sm text-ink-900 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={`r-${t}`} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-ink-100 rounded-xl shadow-xl p-4 animate-fade-in">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => m.subtract(1, 'month'))}
              className="p-1.5 rounded-lg hover:bg-ink-50 transition"
            >
              <ChevronLeft className="w-4 h-4 text-ink-500" />
            </button>
            <span className="text-sm font-semibold text-ink-900">
              Tháng {viewMonth.month() + 1}, {viewMonth.year()}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((m) => m.add(1, 'month'))}
              className="p-1.5 rounded-lg hover:bg-ink-50 transition"
            >
              <ChevronRight className="w-4 h-4 text-ink-500" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-ink-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {daysInMonth.map((date, i) => {
              if (!date) return <div key={`blank-${i}`} />;

              const dateStr = date.format('YYYY-MM-DD');
              const isPast = date.isBefore(minPickup);
              const booked = isDateBooked(date.toDate(), bookedRanges);
              const isPickup = pickupDate === dateStr;
              const isReturn = returnDate === dateStr;
              const inRange = isInRange(date);
              const isToday = date.isSame(today, 'day');
              const disabled = isPast || booked;

              let cls = 'relative w-full aspect-square flex items-center justify-center text-xs rounded-lg transition-all ';
              if (disabled) {
                cls += booked
                  ? 'bg-red-50 text-red-300 cursor-not-allowed line-through'
                  : 'text-ink-200 cursor-not-allowed';
              } else if (isPickup || isReturn) {
                cls += 'bg-brand-primary text-white font-bold shadow-sm';
              } else if (inRange) {
                cls += 'bg-brand-primary/10 text-brand-primary font-medium';
              } else {
                cls += 'text-ink-700 hover:bg-ink-50 cursor-pointer';
              }

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDateClick(date)}
                  className={cls}
                >
                  {date.date()}
                  {isToday && !isPickup && !isReturn && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-accent" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-ink-50">
            <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
              <span className="w-3 h-3 rounded bg-brand-primary" /> Đã chọn
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
              <span className="w-3 h-3 rounded bg-brand-primary/10" /> Khoảng thuê
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-ink-400">
              <span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Đã đặt
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
