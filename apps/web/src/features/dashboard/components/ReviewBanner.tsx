import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function ReviewBanner({ count }: { count: number }) {
  return (
    <Link href="/perlu-dicek" className="review-banner ar-glass">
      <span className="review-banner__icon">
        <Icon name="alert" />
      </span>
      <span className="review-banner__text">
        {count} transaksi perlu dicek. Nominal atau kategorinya belum pasti.
      </span>
      <span className="review-banner__action">Cek sekarang</span>
    </Link>
  );
}
