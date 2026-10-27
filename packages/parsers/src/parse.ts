import type { InboundMessage, ParseOutcome, ProviderParser } from './types.ts';
import { findParser, parsers } from './registry.ts';
import { ignoreReason } from './shared/ignore.ts';

export function parseMessage(
  message: InboundMessage,
  registry: readonly ProviderParser[] = parsers,
): ParseOutcome {
  const parser = findParser(message, registry);
  const providerId = parser?.providerId ?? null;

  const ignored = ignoreReason(message);
  if (ignored) return { status: 'ignored', providerId, reason: ignored };

  if (!parser) return { status: 'unsupported', providerId: null, reason: 'unknown-sender' };
  return parser.parse(message);
}
