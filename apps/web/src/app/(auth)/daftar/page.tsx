import type { Metadata } from 'next';
import { SignUpForm } from '@/features/auth/components/SignUpForm';

export const metadata: Metadata = { title: 'Daftar' };

export default function SignUpPage() {
  return (
    <div className="stack">
      <div>
        <h1 className="title">Buat akun</h1>
        <p className="muted">Gratis. Data transaksimu hanya bisa dilihat olehmu.</p>
      </div>
      <SignUpForm />
    </div>
  );
}
