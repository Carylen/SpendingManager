'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { signUp, type FormState } from '../actions';

const initial: FormState = { status: 'idle' };

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUp, initial);

  if (state.status === 'success') {
    return (
      <div className="stack">
        <Notice tone="success">{state.message}</Notice>
        <Link href="/masuk">Kembali ke halaman masuk</Link>
      </div>
    );
  }

  return (
    <form action={action} className="stack" noValidate>
      {state.message && <Notice tone="error">{state.message}</Notice>}
      <Field
        label="Nama"
        name="displayName"
        autoComplete="name"
        required
        defaultValue={state.values?.displayName}
        error={state.errors?.displayName}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />
      <Field
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="Minimal 8 karakter."
        error={state.errors?.password}
      />
      <Button type="submit" variant="primary" block disabled={pending}>
        {pending ? 'Membuat akun…' : 'Buat akun'}
      </Button>
      <p className="muted">
        Sudah punya akun? <Link href="/masuk">Masuk</Link>
      </p>
    </form>
  );
}
