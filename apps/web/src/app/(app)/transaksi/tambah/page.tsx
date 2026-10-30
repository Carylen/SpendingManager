import type { Metadata } from 'next';
import Link from 'next/link';
import { dayOf } from '@arus/core';
import { Icon } from '@/components/ui/Icon';
import { TransactionForm } from '@/features/transactions/components/TransactionForm';
import { listCategories } from '@/features/transactions/queries';

export const metadata: Metadata = { title: 'Tambah transaksi' };

export default async function AddTransactionPage() {
  const categories = await listCategories();

  return (
    <>
      <header className="page-head">
        <div className="page-head__text">
          <Link href="/transaksi" className="page-head__back">
            <Icon name="chevronLeft" />
            Transaksi
          </Link>
          <h1 className="ar-title">Tambah transaksi</h1>
          <p className="page-head__lead">
            Untuk transaksi tunai atau yang tidak punya email dan SMS.
          </p>
        </div>
      </header>
      <TransactionForm categories={categories} today={dayOf(new Date())} />
    </>
  );
}
