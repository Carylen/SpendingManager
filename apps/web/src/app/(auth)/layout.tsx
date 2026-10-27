import type { ReactNode } from 'react';
import { BrandMark } from '@/components/BrandMark';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth">
      <div className="auth__column enter">
        <BrandMark />
        <section className="glass card auth__card">{children}</section>
      </div>
    </main>
  );
}
