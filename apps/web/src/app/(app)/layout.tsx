import type { ReactNode } from 'react';
import { AppNav } from '@/components/nav/AppNav';
import { appConfig } from '@/config/app';
import { getDisplayName } from '@/features/profile/queries';
import { countNeedsReview } from '@/features/transactions/queries';
import { requireViewer } from '@/lib/auth/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireViewer(appConfig.homePath);
  const [displayName, reviewCount] = await Promise.all([getDisplayName(), countNeedsReview()]);

  return (
    <div className="app">
      <div className="app__nav">
        <AppNav displayName={displayName} reviewCount={reviewCount} />
      </div>
      <main className="app__main">{children}</main>
    </div>
  );
}
