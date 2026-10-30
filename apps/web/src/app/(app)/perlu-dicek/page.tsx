import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = { title: 'Perlu dicek' };

export default function ReviewPage() {
  return (
    <ComingSoon
      title="Perlu dicek"
      lead="Transaksi yang nominal atau kategorinya belum pasti."
      body="Antrean cek muncul setelah transaksi dari email dan SMS mulai tertangkap. Sementara itu, kamu bisa mencatat transaksi sendiri."
    />
  );
}
