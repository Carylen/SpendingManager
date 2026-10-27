import type { ReactNode } from 'react';
import Link from 'next/link';
import { BrandMark } from '@/components/BrandMark';
import { signOut } from '@/features/auth/actions';
import { requireViewer } from '@/lib/auth/session';
import { appConfig } from '@/config/app';

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireViewer(appConfig.homePath);

  return (
    <div className="shell">
      <header className="glass shell__header">
        <Link href={appConfig.homePath} aria-label="Beranda">
          <BrandMark />
        </Link>
        <nav className="shell__nav" aria-label="Akun">
          <Link href="/pengaturan/keamanan">Keamanan</Link>
          <form action={signOut}>
            <button type="submit" className="link-button">
              Keluar
            </button>
          </form>
        </nav>
      </header>
      <main className="shell__main enter">{children}</main>
    </div>
  );
}
