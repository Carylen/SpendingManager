import type { ProviderId } from './providers.ts';
import type { Rupiah } from './money.ts';

export type Direction = 'in' | 'out';

export type Channel = 'email' | 'sms' | 'import' | 'manual';

export interface TransactionDraft {
  direction: Direction;
  amount: Rupiah;
  occurredAt: string;
  merchant: string | null;
  providerId: ProviderId;
  channel: Channel;
  accountHint: string | null;
}
