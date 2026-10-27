import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { appConfig } from '@/config/app';
import { getViewer, needsSecondFactor } from '@/lib/auth/session';
import type { Viewer } from '@/lib/auth/claims';

export const ADMIN_PATH = '/admin';

export async function requireVerifiedAdmin(): Promise<Viewer> {
  const viewer = await getViewer();
  if (viewer?.role !== 'super_admin') notFound();
  if (viewer.assurance === 'aal2') return viewer;

  if (await needsSecondFactor()) {
    redirect(`${appConfig.mfaPath}?next=${encodeURIComponent(ADMIN_PATH)}`);
  }
  redirect('/pengaturan/keamanan?wajib=2fa');
}
