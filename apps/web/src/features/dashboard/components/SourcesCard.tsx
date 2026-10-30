import Link from 'next/link';
import { dayOf, daysBetween, formatTime, relativeDay, type IsoDay } from '@arus/core';
import type { CaptureActivity } from '@/features/transactions/queries';

const SOURCES: Array<{ key: keyof CaptureActivity; title: string; idle: string }> = [
  { key: 'email', title: 'Email forward', idle: 'Belum ada email yang masuk' },
  { key: 'sms', title: 'SMS di iPhone', idle: 'Belum ada SMS yang masuk' },
  { key: 'import', title: 'Impor mutasi', idle: 'Belum pernah impor' },
];

function lastSeen(instant: string, today: IsoDay) {
  const day = dayOf(instant);
  const when = relativeDay(day, today);
  return daysBetween(day, today) <= 1 ? `${when}, ${formatTime(instant)}` : when;
}

export function SourcesCard({ activity, today }: { activity: CaptureActivity; today: IsoDay }) {
  return (
    <section className="ar-card sources">
      <h2 className="ar-heading">Sumber data</h2>
      {SOURCES.map((source) => {
        const seen = activity[source.key];
        return (
          <div key={source.key} className="sources__item">
            {seen ? (
              <span className="ar-badge ar-badge--in">
                <span className="ar-badge__dot" />
                Aktif
              </span>
            ) : (
              <span className="ar-badge">Belum</span>
            )}
            <div className="sources__text">
              <div className="sources__title">{source.title}</div>
              <div className="ar-hint">
                {seen ? `Terakhir ${lastSeen(seen, today)}` : source.idle}
              </div>
            </div>
          </div>
        );
      })}
      <Link href="/sumber" className="ar-btn ar-btn--sm ar-btn--ghost sources__manage">
        Kelola sumber
      </Link>
    </section>
  );
}
