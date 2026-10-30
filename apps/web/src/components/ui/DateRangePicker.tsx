'use client';

import { useEffect, useRef, useState } from 'react';
import {
  addMonths,
  daysBetween,
  eachDay,
  endOfMonth,
  formatDay,
  formatMonth,
  formatRange,
  startOfMonth,
  weekdayIndex,
  type IsoDay,
} from '@arus/core';
import { dayPresets, rangePresets, sameRange, type DayRange } from '@/lib/date-range';
import { Icon } from './Icon';

interface DateRangePickerProps {
  value: DayRange;
  today: IsoDay;
  onChange: (range: DayRange) => void;
  single?: boolean;
  align?: 'start' | 'end';
}

const WEEKDAY_SHORT = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];
const HISTORY_MONTHS = 60;

type Band = 'start' | 'middle' | 'end' | undefined;

export function DateRangePicker({
  value,
  today,
  onChange,
  single = false,
  align = 'end',
}: DateRangePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(value.from);
  const [draftTo, setDraftTo] = useState<IsoDay | null>(value.to);
  const [hovered, setHovered] = useState<IsoDay | null>(null);
  const [month, setMonth] = useState(startOfMonth(value.to));

  const presets = single ? dayPresets(today) : rangePresets(today);
  const firstMonth = startOfMonth(addMonths(today, -HISTORY_MONTHS));
  const lastMonth = startOfMonth(today);
  const shownTo = draftTo ?? (hovered && hovered >= draftFrom ? hovered : draftFrom);

  const close = () => {
    setOpen(false);
    setHovered(null);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      setHovered(null);
      triggerRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const apply = (range: DayRange) => {
    onChange(range);
    close();
  };

  const toggle = () => {
    if (open) return close();
    setDraftFrom(value.from);
    setDraftTo(value.to);
    setMonth(startOfMonth(value.to));
    setOpen(true);
  };

  const pickDay = (day: IsoDay) => {
    if (single) return apply({ from: day, to: day });
    if (draftTo !== null || day < draftFrom) {
      setDraftFrom(day);
      setDraftTo(null);
    } else {
      setDraftTo(day);
      setHovered(null);
    }
  };

  const bandFor = (day: IsoDay): Band => {
    if (single || draftFrom === shownTo || day < draftFrom || day > shownTo) return undefined;
    if (day === draftFrom) return 'start';
    if (day === shownTo) return 'end';
    return 'middle';
  };

  const note = single
    ? 'Ketuk tanggal transaksi'
    : draftTo === null
      ? `Mulai ${formatDay(draftFrom)} · pilih tanggal akhir`
      : `${formatRange(draftFrom, draftTo)} · ${daysBetween(draftFrom, draftTo) + 1} hari`;

  const lead = weekdayIndex(month);
  const days = eachDay(month, endOfMonth(month));
  const classes = ['ar-date', align === 'start' && 'ar-date--start', single && 'ar-date--single'];

  return (
    <div className={classes.filter(Boolean).join(' ')} data-open={open}>
      <button
        ref={triggerRef}
        type="button"
        className="ar-date__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
      >
        <Icon name="calendar" />
        <span>{formatRange(value.from, value.to)}</span>
        <Icon name="chevronDown" className="ar-chev" />
      </button>
      {open && (
        <>
          <button
            type="button"
            className="ar-veil ar-veil--sheet"
            aria-label="Tutup pemilih tanggal"
            onClick={close}
          />
          <div
            ref={dialogRef}
            className="ar-date__pop"
            role="dialog"
            aria-label={single ? 'Pilih tanggal' : 'Pilih rentang tanggal'}
            tabIndex={-1}
          >
            <div className="ar-date__presets">
              <div className="ar-date__label">Cepat</div>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="ar-preset"
                  aria-pressed={sameRange(preset.range, value)}
                  onClick={() => apply(preset.range)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="ar-date__calendar">
              <div className="ar-date__month">
                <button
                  type="button"
                  className="ar-btn ar-btn--icon ar-btn--sm"
                  aria-label="Bulan sebelumnya"
                  disabled={month <= firstMonth}
                  onClick={() => setMonth(addMonths(month, -1))}
                >
                  <Icon name="chevronLeft" />
                </button>
                <div className="ar-date__month-label" aria-live="polite">
                  {formatMonth(month)}
                </div>
                <button
                  type="button"
                  className="ar-btn ar-btn--icon ar-btn--sm"
                  aria-label="Bulan berikutnya"
                  disabled={month >= lastMonth}
                  onClick={() => setMonth(addMonths(month, 1))}
                >
                  <Icon name="chevronRight" />
                </button>
              </div>
              <div className="ar-cal">
                {WEEKDAY_SHORT.map((name) => (
                  <div key={name} className="ar-cal__dow" aria-hidden="true">
                    {name}
                  </div>
                ))}
                {Array.from({ length: lead }, (_, index) => (
                  <div key={`lead-${index}`} className="ar-cal__cell" />
                ))}
                {days.map((day) => (
                  <div key={day} className="ar-cal__cell" data-band={bandFor(day)}>
                    <button
                      type="button"
                      className="ar-cal__day"
                      aria-label={`${Number(day.slice(8))} ${formatMonth(day)}`}
                      aria-pressed={day === draftFrom || day === shownTo}
                      data-today={day === today}
                      disabled={day > today}
                      onClick={() => pickDay(day)}
                      onMouseEnter={() => !single && draftTo === null && setHovered(day)}
                    >
                      {Number(day.slice(8))}
                    </button>
                  </div>
                ))}
              </div>
              <div className="ar-pop__foot">
                <span className="ar-hint">{note}</span>
                <button type="button" className="ar-btn ar-btn--sm ar-btn--ghost" onClick={close}>
                  Batal
                </button>
                {!single && (
                  <button
                    type="button"
                    className="ar-btn ar-btn--sm ar-btn--primary"
                    onClick={() => apply({ from: draftFrom, to: draftTo ?? draftFrom })}
                  >
                    Terapkan
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
