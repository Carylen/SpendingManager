import { placeholderParser } from '../../shared/placeholder.ts';

export const mandiriEmailParser = placeholderParser({
  providerId: 'mandiri',
  channel: 'email',
  senders: [],
});
