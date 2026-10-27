import { describe, expect, it } from 'vitest';
import { isFromAny, normalizeSender } from './sender.ts';
import { toPlainText } from './text.ts';

describe('sender matching', () => {
  it('extracts the address from a display name', () => {
    expect(normalizeSender('BCA <Notif@Example.co.id>')).toBe('notif@example.co.id');
  });

  it('matches exact addresses and domains, including subdomains', () => {
    expect(isFromAny('a@mail.example.co.id', ['@example.co.id'])).toBe(true);
    expect(isFromAny('a@notexample.co.id', ['@example.co.id'])).toBe(false);
    expect(isFromAny('alerts@example.co.id', ['alerts@example.co.id'])).toBe(true);
  });
});

describe('toPlainText', () => {
  it('strips markup and decodes common entities', () => {
    expect(toPlainText('<style>p{}</style><p>Rp&nbsp;28.000</p><p>KOPI &amp; TEH</p>')).toBe(
      'Rp 28.000\nKOPI & TEH',
    );
  });
});
