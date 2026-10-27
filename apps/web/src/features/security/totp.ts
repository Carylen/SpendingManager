import type { SupabaseClient } from '@supabase/supabase-js';

export async function verifiedTotpFactorId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.auth.mfa.listFactors();
  return data?.totp.find((factor) => factor.status === 'verified')?.id ?? null;
}

export async function removeUnverifiedFactors(supabase: SupabaseClient): Promise<void> {
  const { data } = await supabase.auth.mfa.listFactors();
  const pending = data?.all.filter((factor) => factor.status === 'unverified') ?? [];
  await Promise.all(pending.map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })));
}
