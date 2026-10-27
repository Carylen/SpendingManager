import { describe, expect, it } from 'vitest';
import { parseMessage } from './parse.ts';
import { parsers } from './registry.ts';
import { placeholderParser } from './shared/placeholder.ts';
import type { InboundMessage } from './types.ts';

const message = (overrides: Partial<InboundMessage> = {}): InboundMessage => ({
  channel: 'email',
  sender: 'Notifikasi <notify@bank.example>',
  subject: 'Transaksi berhasil',
  body: '<p>Pembayaran Rp28.000 ke KOPI berhasil</p>',
  receivedAt: '2026-10-27T09:12:00+07:00',
  ...overrides,
});

describe('parseMessage', () => {
  it('reports an unknown sender as unsupported', () => {
    expect(parseMessage(message())).toEqual({
      status: 'unsupported',
      providerId: null,
      reason: 'unknown-sender',
    });
  });

  it('ignores one-time passwords before parsing', () => {
    const outcome = parseMessage(message({ subject: 'Kode OTP kamu', body: '123456' }));
    expect(outcome).toMatchObject({ status: 'ignored', reason: 'one-time-password' });
  });

  it('routes a known sender to its provider placeholder', () => {
    const registry = [
      placeholderParser({ providerId: 'bca', channel: 'email', senders: ['@bank.example'] }),
    ];
    expect(parseMessage(message(), registry)).toEqual({
      status: 'unsupported',
      providerId: 'bca',
      reason: 'awaiting-samples',
    });
  });

  it('does not route an email parser to an sms message', () => {
    const registry = [
      placeholderParser({ providerId: 'bca', channel: 'email', senders: ['@bank.example'] }),
    ];
    expect(parseMessage(message({ channel: 'sms' }), registry)).toMatchObject({
      reason: 'unknown-sender',
    });
  });
});

describe('registry', () => {
  it('has one email parser for each of the seven launch providers', () => {
    const emailProviders = parsers.filter((p) => p.channel === 'email').map((p) => p.providerId);
    expect(new Set(emailProviders)).toEqual(
      new Set(['bca', 'mandiri', 'ocbc', 'bri', 'gopay', 'shopeepay', 'dana']),
    );
  });
});
