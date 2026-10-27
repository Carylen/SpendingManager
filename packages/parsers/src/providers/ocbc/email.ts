import { placeholderParser } from '../../shared/placeholder.ts';

export const ocbcEmailParser = placeholderParser({
  providerId: 'ocbc',
  channel: 'email',
  senders: [],
});
