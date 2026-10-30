import 'server-only';
import { cache } from 'react';
import { getViewer } from '@/lib/auth/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const getDisplayName = cache(async (): Promise<string> => {
  const viewer = await getViewer();
  if (!viewer) return '';
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', viewer.id)
    .maybeSingle();
  return data?.display_name ?? '';
});
