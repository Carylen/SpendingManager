import { describe, expect, it } from 'vitest';
import { timeBucket, transactionFingerprint } from './fingerprint.ts';

const base = {
  userId: 'user-1',
  direction: 'out' as const,
  amount: 28000,
  occurredAt: '2026-10-27T09:12:00+07:00',
  accountId: 'account-1',
};

describe('transactionFingerprint', () => {
  it('matches the same transaction seen through two channels minutes apart', async () => {
    const fromEmail = await transactionFingerprint(base);
    const fromSms = await transactionFingerprint({
      ...base,
      occurredAt: '2026-10-27T09:13:40+07:00',
    });
    expect(fromSms).toBe(fromEmail);
  });

  it('differs when the amount differs', async () => {
    const first = await transactionFingerprint(base);
    const second = await transactionFingerprint({ ...base, amount: 28500 });
    expect(second).not.toBe(first);
  });

  it('rejects invalid timestamps', () => {
    expect(() => timeBucket('not a date')).toThrow(RangeError);
  });
});
