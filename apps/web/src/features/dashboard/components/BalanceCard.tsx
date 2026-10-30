'use client';

import { useEffect, useState } from 'react';
import { formatDay, formatRupiah } from '@arus/core';
import { useCountUp } from '@/components/ui/useCountUp';
import type { SpendBucket } from '../summary';

interface BalanceCardProps {
  rangeLabel: string;
  totalIn: number;
  totalOut: number;
  buckets: SpendBucket[];
}

const BAR_MAX = 72;
const BAR_MIN = 8;

const bucketLabel = (bucket: SpendBucket) =>
  bucket.from === bucket.to
    ? formatDay(bucket.from)
    : `${formatDay(bucket.from)}–${formatDay(bucket.to)}`;

export function BalanceCard({ rangeLabel, totalIn, totalOut, buckets }: BalanceCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [grown, setGrown] = useState(false);
  const shownIn = useCountUp(totalIn, rangeLabel);
  const shownOut = useCountUp(totalOut, rangeLabel);
  const net = shownIn - shownOut;
  const peak = Math.max(1, ...buckets.map((bucket) => bucket.out));
  const daily = buckets[0]?.from === buckets[0]?.to;
  const pick = selected === null ? null : buckets[selected];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="ar-card">
      <div className="ar-kicker">Saldo bersih · {rangeLabel}</div>
      <div className="ar-balance">{formatRupiah(net)}</div>
      <div className="ar-split">
        <div className="ar-split__item">
          <span className="ar-badge ar-badge--in">
            <span className="ar-badge__dot" />
            Masuk
          </span>
          <div className="ar-split__val" style={{ marginTop: 8, color: 'var(--flow-in)' }}>
            {formatRupiah(shownIn, 'in')}
          </div>
        </div>
        <div className="ar-split__item">
          <span className="ar-badge ar-badge--out">
            <span className="ar-badge__dot" />
            Keluar
          </span>
          <div className="ar-split__val" style={{ marginTop: 8, color: 'var(--flow-out)' }}>
            {formatRupiah(shownOut, 'out')}
          </div>
        </div>
      </div>
      <div
        className={buckets.length > 35 ? 'ar-bars ar-bars--dense' : 'ar-bars'}
        role="group"
        aria-label={daily ? 'Pengeluaran harian' : 'Pengeluaran mingguan'}
      >
        {buckets.map((bucket, index) => (
          <button
            key={bucket.from}
            type="button"
            aria-label={`${bucketLabel(bucket)}, keluar ${formatRupiah(bucket.out)}`}
            aria-pressed={selected === index}
            onClick={() => setSelected(selected === index ? null : index)}
            style={{
              ['--h' as string]: `${grown ? Math.max(BAR_MIN, (bucket.out / peak) * BAR_MAX) : BAR_MIN}px`,
            }}
          />
        ))}
      </div>
      <p className="ar-hint" style={{ marginTop: 10 }} aria-live="polite">
        {pick
          ? `${bucketLabel(pick)} · keluar ${formatRupiah(pick.out)}`
          : `Ketuk batang untuk melihat pengeluaran per ${daily ? 'hari' : 'minggu'}.`}
      </p>
    </section>
  );
}
