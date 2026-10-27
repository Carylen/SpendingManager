import { placeholderParser } from '../../shared/placeholder.ts';

export const briSmsParser = placeholderParser({
  providerId: 'bri',
  channel: 'sms',
  senders: [],
});
