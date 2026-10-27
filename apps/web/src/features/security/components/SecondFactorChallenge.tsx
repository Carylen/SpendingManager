'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { totpCodeSchema } from '@/features/auth/schemas';
import { verifiedTotpFactorId } from '../totp';

export function SecondFactorChallenge({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = totpCodeSchema.safeParse(new FormData(event.currentTarget).get('code'));
    if (!code.success) return setError(code.error.issues[0]?.message ?? null);

    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const factorId = await verifiedTotpFactorId(supabase);
    const result = factorId
      ? await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.data })
      : { error: new Error('no factor') };

    if (result.error) {
      setPending(false);
      return setError(
        'Kode salah atau sudah kedaluwarsa. Coba kode terbaru dari aplikasi authenticator.',
      );
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="stack" noValidate>
      {error && <Notice tone="error">{error}</Notice>}
      <Field
        label="Kode 6 angka"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        className="input--code"
        autoFocus
        required
      />
      <Button type="submit" variant="primary" block disabled={pending}>
        {pending ? 'Memeriksa…' : 'Verifikasi'}
      </Button>
    </form>
  );
}
