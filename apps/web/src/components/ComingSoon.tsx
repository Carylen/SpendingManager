import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  lead: string;
  body: string;
}

export function ComingSoon({ title, lead, body }: ComingSoonProps) {
  return (
    <>
      <header className="page-head">
        <div className="page-head__text">
          <h1 className="ar-title">{title}</h1>
          <p className="page-head__lead">{lead}</p>
        </div>
      </header>
      <section className="ar-card">
        <div className="empty">
          <div className="empty__title">Segera hadir</div>
          <p className="ar-hint">{body}</p>
          <Link href="/transaksi/tambah" className="ar-btn ar-btn--sm">
            Catat transaksi manual
          </Link>
        </div>
      </section>
    </>
  );
}
