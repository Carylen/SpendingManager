import { placeholderParser } from '../../shared/placeholder.ts';

export const bcaSmsParser = placeholderParser({
  providerId: 'bca',
  channel: 'sms',
  senders: [],
});
