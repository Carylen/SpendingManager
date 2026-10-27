import type { ProviderId } from '@arus/core';
import type { InboundChannel, ProviderParser } from '../types.ts';
import { isFromAny } from './sender.ts';

interface PlaceholderOptions {
  providerId: ProviderId;
  channel: InboundChannel;
  senders: readonly string[];
}

export function placeholderParser({
  providerId,
  channel,
  senders,
}: PlaceholderOptions): ProviderParser {
  return {
    providerId,
    channel,
    canHandle: (message) => message.channel === channel && isFromAny(message.sender, senders),
    parse: () => ({ status: 'unsupported', providerId, reason: 'awaiting-samples' }),
  };
}
