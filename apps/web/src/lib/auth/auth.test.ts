import { describe, expect, it } from 'vitest';
import { isVerifiedAdmin, viewerFromClaims, type Viewer } from './claims';
import { safeNextPath } from './redirect';
import { decideRoute } from './routes';

const viewer = (overrides: Partial<Viewer> = {}): Viewer => ({
  id: 'u1',
  email: 'serra@example.com',
  role: 'user',
  status: 'active',
  assurance: 'aal1',
  ...overrides,
});

describe('viewerFromClaims', () => {
  it('reads role, status and assurance from custom claims', () => {
    expect(
      viewerFromClaims({
        sub: 'u1',
        user_role: 'super_admin',
        account_status: 'active',
        aal: 'aal2',
      }),
    ).toMatchObject({ role: 'super_admin', status: 'active', assurance: 'aal2' });
  });

  it('defaults unknown roles to a regular user', () => {
    expect(viewerFromClaims({ sub: 'u1', user_role: 'root' })?.role).toBe('user');
  });

  it('returns null without a subject', () => {
    expect(viewerFromClaims({})).toBeNull();
  });
});

describe('isVerifiedAdmin', () => {
  it('requires both the role and a second factor', () => {
    expect(isVerifiedAdmin(viewer({ role: 'super_admin', assurance: 'aal1' }))).toBe(false);
    expect(isVerifiedAdmin(viewer({ role: 'super_admin', assurance: 'aal2' }))).toBe(true);
    expect(isVerifiedAdmin(viewer({ assurance: 'aal2' }))).toBe(false);
  });
});

describe('safeNextPath', () => {
  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 42])(
    'rejects %s',
    (value) => {
      expect(safeNextPath(value, '/beranda')).toBe('/beranda');
    },
  );

  it('keeps internal paths', () => {
    expect(safeNextPath('/pengaturan/keamanan', '/beranda')).toBe('/pengaturan/keamanan');
  });
});

describe('decideRoute', () => {
  it('sends guests from protected pages to sign in, keeping the destination', () => {
    expect(decideRoute('/beranda', null)).toEqual({
      type: 'redirect',
      to: '/masuk?next=%2Fberanda',
    });
  });

  it.each(['/transaksi', '/transaksi/tambah', '/perlu-dicek', '/sumber', '/impor'])(
    'protects %s',
    (pathname) => {
      expect(decideRoute(pathname, null)).toMatchObject({ type: 'redirect' });
    },
  );

  it('sends signed-in users away from sign in', () => {
    expect(decideRoute('/masuk', viewer())).toEqual({ type: 'redirect', to: '/beranda' });
  });

  it('keeps the second factor page reachable while signed in', () => {
    expect(decideRoute('/masuk/verifikasi', viewer())).toEqual({ type: 'allow' });
  });

  it('signs out disabled accounts', () => {
    expect(decideRoute('/beranda', viewer({ status: 'disabled' }))).toMatchObject({
      type: 'sign-out',
    });
  });
});

describe('admin route', () => {
  it('is not advertised to guests through a sign-in redirect', () => {
    expect(decideRoute('/admin', null)).toEqual({ type: 'allow' });
  });
});
