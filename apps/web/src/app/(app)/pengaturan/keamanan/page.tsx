import type { Metadata } from 'next';
import { TotpSettings } from '@/features/security/components/TotpSettings';

export const metadata: Metadata = { title: 'Keamanan' };

export default function SecurityPage() {
  return (
    <div className="stack">
      <h1 className="title">Keamanan</h1>
      <TotpSettings />
    </div>
  );
}
