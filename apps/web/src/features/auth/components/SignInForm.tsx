'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { signIn, type FormState } from '../actions';

const initial: FormState = { status: 'idle' };

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);

  return (
    <form action={action} className="stack" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {state.message && <Notice tone="error">{state.message}</Notice>}
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
        autoComplete="current-password"
        required
        error={state.errors?.password}
      />
      <Button type="submit" variant="primary" block disabled={pending}>
        {pending ? 'Memeriksa…' : 'Masuk'}
      </Button>
      <p className="muted">
        Belum punya akun? <Link href="/daftar">Daftar</Link>
      </p>
    </form>
  );
}
