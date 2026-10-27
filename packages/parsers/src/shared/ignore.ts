import type { IgnoreReason, InboundMessage } from '../types.ts';
import { toPlainText } from './text.ts';

const ONE_TIME_PASSWORD = /\b(otp|kode verifikasi|kode rahasia|one[- ]time password)\b/i;

export function ignoreReason(message: InboundMessage): IgnoreReason | null {
  const text = `${message.subject ?? ''}\n${toPlainText(message.body)}`;
  return ONE_TIME_PASSWORD.test(text) ? 'one-time-password' : null;
}
