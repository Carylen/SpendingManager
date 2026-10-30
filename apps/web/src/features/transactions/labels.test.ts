import { describe, expect, it } from 'vitest';
import { whenLabel } from './labels';

const today = '2026-10-31';

describe('whenLabel', () => {
  it('shows the clock time when it is known', () => {
    const known = { occurredAt: '2026-10-31T02:12:00Z', timeKnown: true };
    expect(whenLabel(known, today, false)).toBe('09.12');
    expect(whenLabel(known, today, true)).toBe('Hari ini, 09.12');
  });

  it('hides the time for entries where only the day is known', () => {
    const dayOnly = { occurredAt: '2026-10-30T05:00:00Z', timeKnown: false };
    expect(whenLabel(dayOnly, today, false)).toBe('');
    expect(whenLabel(dayOnly, today, true)).toBe('Kemarin');
    expect(whenLabel({ ...dayOnly, occurredAt: '2026-10-25T05:00:00Z' }, today, true)).toBe(
      '25 Okt',
    );
  });
});
