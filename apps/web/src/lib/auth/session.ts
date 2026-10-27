import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { appConfig } from '@/config/app';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { viewerFromClaims, type Viewer } from './claims';

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  return viewerFromClaims(data?.claims ?? null);
});

export async function needsSecondFactor(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.currentLevel === 'aal1' && data.nextLevel === 'aal2';
}

export async function requireViewer(nextPath: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`${appConfig.signInPath}?next=${encodeURIComponent(nextPath)}`);
  if (await needsSecondFactor())
    redirect(`${appConfig.mfaPath}?next=${encodeURIComponent(nextPath)}`);
  return viewer;
}
