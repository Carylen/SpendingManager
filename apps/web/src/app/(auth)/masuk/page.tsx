import type { Metadata } from 'next';
import { Notice } from '@/components/ui/Notice';
import { SignInForm } from '@/features/auth/components/SignInForm';
import { safeNextPath } from '@/lib/auth/redirect';
import { appConfig } from '@/config/app';

export const metadata: Metadata = { title: 'Masuk' };

const STATUS_MESSAGES: Record<string, { tone: 'error' | 'success'; text: string }> = {
  nonaktif: {
    tone: 'error',
    text: 'Akun ini dinonaktifkan. Hubungi dukungan kalau menurutmu ini keliru.',
  },
  dikonfirmasi: { tone: 'success', text: 'Email terkonfirmasi. Silakan masuk.' },
  gagal: { tone: 'error', text: 'Tautan konfirmasi tidak valid atau sudah kedaluwarsa.' },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; status?: string }>;
}) {
  const { next, status } = await searchParams;
  const notice = status ? STATUS_MESSAGES[status] : undefined;

  return (
    <div className="stack">
      <div>
        <h1 className="title">Masuk ke {appConfig.name}</h1>
        <p className="muted">Transaksi dari email dan SMS bank tercatat otomatis.</p>
      </div>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <SignInForm next={next ? safeNextPath(next, appConfig.homePath) : undefined} />
    </div>
  );
}
