import 'server-only';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function recentAuditLogs(limit = 20) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, target_type, target_id, reason, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function countUsers() {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}
