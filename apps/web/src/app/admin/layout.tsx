import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/BrandMark';
import { requireVerifiedAdmin } from '@/features/admin/guard';

export const metadata: Metadata = { title: 'Panel admin', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireVerifiedAdmin();

  return (
    <div className="shell">
      <header className="glass shell__header">
        <BrandMark />
        <span className="shell__badge">Panel admin</span>
      </header>
      <main className="shell__main enter">{children}</main>
    </div>
  );
}
