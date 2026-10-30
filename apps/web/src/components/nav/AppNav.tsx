'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { Icon, type IconName } from '@/components/ui/Icon';
import { appConfig } from '@/config/app';
import { signOut } from '@/features/auth/actions';

interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: IconName;
  counted?: boolean;
}

const ITEMS: NavItem[] = [
  { href: '/beranda', label: 'Beranda', short: 'Beranda', icon: 'home' },
  { href: '/transaksi', label: 'Transaksi', short: 'Transaksi', icon: 'list' },
  { href: '/perlu-dicek', label: 'Perlu dicek', short: 'Dicek', icon: 'alert', counted: true },
  { href: '/sumber', label: 'Hubungkan sumber', short: 'Sumber', icon: 'link' },
  { href: '/impor', label: 'Impor mutasi', short: 'Impor', icon: 'download' },
];

const SETTINGS_PATH = '/pengaturan';

const isWithin = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

interface AppNavProps {
  displayName: string;
  reviewCount: number;
}

export function AppNav({ displayName, reviewCount }: AppNavProps) {
  const pathname = usePathname();
  const active = ITEMS.findIndex((item) => isWithin(pathname, item.href));
  const name = displayName || 'Kamu';

  return (
    <nav aria-label="Menu utama" className="ar-nav ar-glass">
      <Link href={appConfig.homePath} className="ar-nav__brand" aria-label="Beranda">
        <BrandMark />
      </Link>
      <div className="ar-nav__list">
        <span
          className="ar-nav__pill"
          aria-hidden="true"
          style={{ ['--i' as string]: Math.max(active, 0), opacity: active < 0 ? 0 : 1 }}
        />
        {ITEMS.map((item, index) => {
          const count = item.counted ? reviewCount : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="ar-nav__item"
              aria-current={index === active ? 'page' : undefined}
              aria-label={count ? `${item.label}, ${count} transaksi` : item.label}
            >
              <Icon name={item.icon} />
              <span className="ar-nav__full">{item.label}</span>
              <span className="ar-nav__short">{item.short}</span>
              {count > 0 && (
                <>
                  <span className="ar-badge ar-badge--warn ar-nav__count">{count}</span>
                  <span className="ar-nav__dot" aria-hidden="true" />
                </>
              )}
            </Link>
          );
        })}
      </div>
      <div className="ar-nav__user" data-current={isWithin(pathname, SETTINGS_PATH)}>
        <span className="ar-avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
        <Link href="/pengaturan/keamanan" className="ar-nav__profile">
          <span className="ar-nav__name">{name}</span>
          <span className="ar-nav__sub">Pengaturan akun</span>
        </Link>
        <form action={signOut}>
          <button type="submit" className="ar-nav__signout">
            Keluar
          </button>
        </form>
      </div>
    </nav>
  );
}
