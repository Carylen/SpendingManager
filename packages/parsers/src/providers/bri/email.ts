import { placeholderParser } from '../../shared/placeholder.ts';

export const briEmailParser = placeholderParser({
  providerId: 'bri',
  channel: 'email',
  senders: [],
});
