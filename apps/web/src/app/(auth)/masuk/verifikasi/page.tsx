import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SecondFactorChallenge } from '@/features/security/components/SecondFactorChallenge';
import { signOut } from '@/features/auth/actions';
import { getViewer, needsSecondFactor } from '@/lib/auth/session';
import { safeNextPath } from '@/lib/auth/redirect';
import { appConfig } from '@/config/app';

export const metadata: Metadata = { title: 'Verifikasi 2 langkah' };

export default async function SecondFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next, appConfig.homePath);
  if (!(await getViewer())) redirect(appConfig.signInPath);
  if (!(await needsSecondFactor())) redirect(next);

  return (
    <div className="stack">
      <div>
        <h1 className="title">Verifikasi 2 langkah</h1>
        <p className="muted">
          Buka aplikasi authenticator di HP-mu, lalu ketik 6 angka yang muncul.
        </p>
      </div>
      <SecondFactorChallenge next={next} />
      <form action={signOut}>
        <button type="submit" className="link-button">
          Bukan kamu? Keluar
        </button>
      </form>
    </div>
  );
}
