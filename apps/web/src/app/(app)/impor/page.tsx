import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = { title: 'Impor mutasi' };

export default function ImportPage() {
  return (
    <ComingSoon
      title="Impor mutasi"
      lead="Unggah mutasi CSV atau PDF dari bank dan e-wallet."
      body="Impor mutasi sedang disiapkan. Sementara itu, kamu bisa mencatat transaksi sendiri."
    />
  );
}
