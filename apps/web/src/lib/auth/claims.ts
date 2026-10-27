import type { AccountStatus, AppRole } from '@/lib/supabase/database.types';

export type AssuranceLevel = 'aal1' | 'aal2';

export interface Viewer {
  id: string;
  email: string | null;
  role: AppRole;
  status: AccountStatus;
  assurance: AssuranceLevel;
}

export function viewerFromClaims(claims: Record<string, unknown> | null): Viewer | null {
  if (!claims || typeof claims.sub !== 'string') return null;
  return {
    id: claims.sub,
    email: typeof claims.email === 'string' ? claims.email : null,
    role: claims.user_role === 'super_admin' ? 'super_admin' : 'user',
    status: claims.account_status === 'disabled' ? 'disabled' : 'active',
    assurance: claims.aal === 'aal2' ? 'aal2' : 'aal1',
  };
}

export function isVerifiedAdmin(viewer: Viewer | null): boolean {
  return viewer?.role === 'super_admin' && viewer.assurance === 'aal2';
}
