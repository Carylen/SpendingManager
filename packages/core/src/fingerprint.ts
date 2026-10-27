import type { Direction } from './transaction.ts';
import type { Rupiah } from './money.ts';

export interface FingerprintInput {
  userId: string;
  direction: Direction;
  amount: Rupiah;
  occurredAt: string;
  accountId: string | null;
}

const BUCKET_MINUTES = 5;

export function timeBucket(occurredAt: string, minutes = BUCKET_MINUTES): number {
  const time = Date.parse(occurredAt);
  if (Number.isNaN(time)) throw new RangeError(`Invalid timestamp: ${occurredAt}`);
  return Math.floor(time / (minutes * 60_000));
}

export async function transactionFingerprint(input: FingerprintInput): Promise<string> {
  const key = [
    input.userId,
    input.direction,
    input.amount,
    timeBucket(input.occurredAt),
    input.accountId ?? '',
  ].join('|');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
