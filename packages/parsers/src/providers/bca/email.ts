import { placeholderParser } from '../../shared/placeholder.ts';

export const bcaEmailParser = placeholderParser({
  providerId: 'bca',
  channel: 'email',
  senders: [],
});
