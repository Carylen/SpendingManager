import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getViewer } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Beranda' };

export default async function HomePage() {
  const viewer = await getViewer();
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', viewer!.id)
    .single();

  return (
    <section className="glass card stack">
      <h1 className="title">Halo, {profile?.display_name || 'kamu'}</h1>
      <p className="muted">Akunmu sudah siap. Ringkasan transaksi akan muncul di sini.</p>
    </section>
  );
}
