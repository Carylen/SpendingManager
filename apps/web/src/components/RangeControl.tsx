'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { IsoDay } from '@arus/core';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { writeRange, type DayRange } from '@/lib/date-range';

export function RangeControl({ range, today }: { range: DayRange; today: IsoDay }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <DateRangePicker
      value={range}
      today={today}
      onChange={(next) => {
        const query = writeRange(new URLSearchParams(searchParams), next, today).toString();
        router.push(query ? `${pathname}?${query}` : pathname);
      }}
    />
  );
}
