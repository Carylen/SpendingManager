import { placeholderParser } from '../../shared/placeholder.ts';

export const danaEmailParser = placeholderParser({
  providerId: 'dana',
  channel: 'email',
  senders: [],
});
