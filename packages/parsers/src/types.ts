import type { ProviderId, TransactionDraft } from '@arus/core';

export type InboundChannel = 'email' | 'sms';

export interface InboundMessage {
  channel: InboundChannel;
  sender: string;
  subject: string | null;
  body: string;
  receivedAt: string;
}

export type ParseOutcome =
  | { status: 'parsed'; providerId: ProviderId; draft: TransactionDraft; confidence: number }
  | { status: 'ignored'; providerId: ProviderId | null; reason: IgnoreReason }
  | { status: 'unsupported'; providerId: ProviderId | null; reason: UnsupportedReason };

export type IgnoreReason = 'one-time-password' | 'not-a-transaction';

export type UnsupportedReason = 'unknown-sender' | 'awaiting-samples' | 'unrecognized-format';

export interface ProviderParser {
  providerId: ProviderId;
  channel: InboundChannel;
  canHandle(message: InboundMessage): boolean;
  parse(message: InboundMessage): ParseOutcome;
}
