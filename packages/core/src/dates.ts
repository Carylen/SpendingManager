export type IsoDay = string;

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];
const MONTHS_LONG = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const toUtcMidnight = (day: IsoDay) => Date.parse(`${day}T00:00:00Z`);
const fromUtcMidnight = (time: number): IsoDay => new Date(time).toISOString().slice(0, 10);
const parts = (day: IsoDay) => {
  const date = new Date(toUtcMidnight(day));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    date: date.getUTCDate(),
    weekday: date.getUTCDay(),
  };
};

export function isIsoDay(value: unknown): value is IsoDay {
  if (typeof value !== 'string') return false;
  const match = ISO_DAY.exec(value);
  if (!match) return false;
  return fromUtcMidnight(toUtcMidnight(value)) === value;
}

/** Calendar day in Asia/Jakarta (UTC+7, no daylight saving). */
export function dayOf(instant: Date | string): IsoDay {
  const time = typeof instant === 'string' ? Date.parse(instant) : instant.getTime();
  if (Number.isNaN(time)) throw new RangeError(`Invalid timestamp: ${String(instant)}`);
  return fromUtcMidnight(time + JAKARTA_OFFSET_MS);
}

export function addDays(day: IsoDay, amount: number): IsoDay {
  return fromUtcMidnight(toUtcMidnight(day) + amount * DAY_MS);
}

export function daysBetween(from: IsoDay, to: IsoDay): number {
  return Math.round((toUtcMidnight(to) - toUtcMidnight(from)) / DAY_MS);
}

export function startOfMonth(day: IsoDay): IsoDay {
  return `${day.slice(0, 7)}-01`;
}

export function endOfMonth(day: IsoDay): IsoDay {
  const { year, month } = parts(day);
  return fromUtcMidnight(Date.UTC(year, month + 1, 0));
}

export function addMonths(day: IsoDay, amount: number): IsoDay {
  const { year, month } = parts(day);
  return fromUtcMidnight(Date.UTC(year, month + amount, 1));
}

export function eachDay(from: IsoDay, to: IsoDay): IsoDay[] {
  const length = daysBetween(from, to) + 1;
  return Array.from({ length: Math.max(0, length) }, (_, index) => addDays(from, index));
}

/** Start of the day in Asia/Jakarta as a UTC ISO timestamp. */
export function dayStartInstant(day: IsoDay): string {
  return new Date(toUtcMidnight(day) - JAKARTA_OFFSET_MS).toISOString();
}

/** A moment on the given Jakarta day at the given Jakarta clock time. */
export function instantOn(day: IsoDay, hours: number, minutes = 0): string {
  return new Date(
    toUtcMidnight(day) - JAKARTA_OFFSET_MS + (hours * 60 + minutes) * 60_000,
  ).toISOString();
}

export function formatDay(day: IsoDay): string {
  const { month, date } = parts(day);
  return `${date} ${MONTHS_SHORT[month]}`;
}

export function formatMonth(day: IsoDay): string {
  const { year, month } = parts(day);
  return `${MONTHS_LONG[month]} ${year}`;
}

export function formatLongDate(day: IsoDay): string {
  const { year, month, date, weekday } = parts(day);
  return `${WEEKDAYS[weekday]}, ${date} ${MONTHS_LONG[month]} ${year}`;
}

export function formatRange(from: IsoDay, to: IsoDay): string {
  const start = parts(from);
  const end = parts(to);
  if (from === to) return `${formatDay(to)} ${end.year}`;
  if (start.year !== end.year)
    return `${formatDay(from)} ${start.year} – ${formatDay(to)} ${end.year}`;
  if (start.month !== end.month) return `${formatDay(from)} – ${formatDay(to)} ${end.year}`;
  return `${start.date}–${formatDay(to)} ${end.year}`;
}

export function formatTime(instant: string): string {
  const shifted = new Date(Date.parse(instant) + JAKARTA_OFFSET_MS);
  const hours = String(shifted.getUTCHours()).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}

/** "Hari ini", "Kemarin", or "24 Okt". */
export function relativeDay(day: IsoDay, today: IsoDay): string {
  const gap = daysBetween(day, today);
  if (gap === 0) return 'Hari ini';
  if (gap === 1) return 'Kemarin';
  return formatDay(day);
}

/** Heading for a day of transactions: "Hari ini, 27 Okt", "Minggu, 25 Okt". */
export function dayHeading(day: IsoDay, today: IsoDay): string {
  const gap = daysBetween(day, today);
  const lead = gap === 0 ? 'Hari ini' : gap === 1 ? 'Kemarin' : WEEKDAYS[parts(day).weekday];
  return `${lead}, ${formatDay(day)}`;
}

/** Monday-first weekday index (0 = Senin). */
export function weekdayIndex(day: IsoDay): number {
  return (parts(day).weekday + 6) % 7;
}
