import { appConfig } from '@/config/app';
import type { Viewer } from './claims';

const GUEST_ONLY = ['/masuk', '/daftar'];
const PUBLIC = ['/auth/callback', appConfig.mfaPath];
const PROTECTED = ['/beranda', '/transaksi', '/perlu-dicek', '/sumber', '/impor', '/pengaturan'];

const matches = (pathname: string, prefixes: readonly string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export type RouteDecision =
  { type: 'allow' } | { type: 'redirect'; to: string } | { type: 'sign-out'; to: string };

export function decideRoute(pathname: string, viewer: Viewer | null): RouteDecision {
  if (matches(pathname, PUBLIC)) return { type: 'allow' };

  if (viewer?.status === 'disabled') {
    return { type: 'sign-out', to: `${appConfig.signInPath}?status=nonaktif` };
  }

  if (matches(pathname, GUEST_ONLY)) {
    return viewer ? { type: 'redirect', to: appConfig.homePath } : { type: 'allow' };
  }

  if (matches(pathname, PROTECTED) && !viewer) {
    return { type: 'redirect', to: `${appConfig.signInPath}?next=${encodeURIComponent(pathname)}` };
  }

  return { type: 'allow' };
}
