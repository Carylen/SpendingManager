import type { SVGProps } from 'react';

const PATHS = {
  home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  alert: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v5M12 16.5v.5',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  download: 'M12 4v11M7 10l5 5 5-5M4 20h16',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  chevronDown: 'm6 9 6 6 6-6',
  chevronLeft: 'm15 6-6 6 6 6',
  chevronRight: 'm9 6 6 6-6 6',
  check: 'm5 12 5 5 9-10',
  calendar:
    'M7 5h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM4 10h16M9 3v4M15 3v4',
  card: 'M6 6h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3zM3 10h18',
  flowIn: 'M17 7 7 17M7 8v9h9',
  flowOut: 'M7 17 17 7M8 7h9v9',
  wallet: 'M4 7h16v10H4zM4 11h16M8 15h3',
  food: 'M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h1.5a2.5 2.5 0 0 1 0 5H17',
  bag: 'M6 7h12l-1 13H7zM9 7a3 3 0 0 1 6 0',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6z',
  car: 'M5 16V9l2-4h10l2 4v7M5 16h14M7 19v-3M17 19v-3M5 11h14',
  transfer: 'M4 9h14l-3-3M20 15H6l3 3',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={['ar-ico', className].filter(Boolean).join(' ')}
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

const CATEGORY_ICONS: Array<[RegExp, IconName]> = [
  [/gaji|bonus|payroll/i, 'wallet'],
  [/makan|minum|kopi|resto/i, 'food'],
  [/belanja/i, 'bag'],
  [/tagihan|listrik|pln/i, 'bolt'],
  [/transport|bensin/i, 'car'],
  [/transfer|antar akun|top.?up/i, 'transfer'],
];

export const categoryIcon = (name: string): IconName =>
  CATEGORY_ICONS.find(([pattern]) => pattern.test(name))?.[1] ?? 'more';
