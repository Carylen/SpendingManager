import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = { title: 'Hubungkan sumber' };

export default function SourcesPage() {
  return (
    <ComingSoon
      title="Hubungkan sumber"
      lead="Teruskan email bank dan e-wallet supaya transaksi tercatat sendiri."
      body="Alamat forward pribadimu dan panduan per bank sedang disiapkan. Sementara itu, kamu bisa mencatat transaksi sendiri."
    />
  );
}
