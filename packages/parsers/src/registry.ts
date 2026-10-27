import type { InboundMessage, ProviderParser } from './types.ts';
import { bcaEmailParser } from './providers/bca/email.ts';
import { bcaSmsParser } from './providers/bca/sms.ts';
import { briEmailParser } from './providers/bri/email.ts';
import { briSmsParser } from './providers/bri/sms.ts';
import { mandiriEmailParser } from './providers/mandiri/email.ts';
import { ocbcEmailParser } from './providers/ocbc/email.ts';
import { gopayEmailParser } from './providers/gopay/email.ts';
import { shopeepayEmailParser } from './providers/shopeepay/email.ts';
import { danaEmailParser } from './providers/dana/email.ts';

export const parsers: readonly ProviderParser[] = [
  bcaEmailParser,
  bcaSmsParser,
  briEmailParser,
  briSmsParser,
  mandiriEmailParser,
  ocbcEmailParser,
  gopayEmailParser,
  shopeepayEmailParser,
  danaEmailParser,
];

export function findParser(
  message: InboundMessage,
  registry: readonly ProviderParser[] = parsers,
): ProviderParser | undefined {
  return registry.find((parser) => parser.canHandle(message));
}
