import { placeholderParser } from '../../shared/placeholder.ts';

export const gopayEmailParser = placeholderParser({
  providerId: 'gopay',
  channel: 'email',
  senders: [],
});
