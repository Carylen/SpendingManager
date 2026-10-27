import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="auth">
      <section className="glass card stack auth__card">
        <h1 className="title">Halaman tidak ditemukan</h1>
        <p className="muted">Alamatnya mungkin salah ketik atau halamannya sudah dipindah.</p>
        <Link href="/">Ke beranda</Link>
      </section>
    </main>
  );
}
