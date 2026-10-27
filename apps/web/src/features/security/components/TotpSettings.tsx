'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Notice } from '@/components/ui/Notice';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { totpCodeSchema } from '@/features/auth/schemas';
import { removeUnverifiedFactors, verifiedTotpFactorId } from '../totp';

type State =
  | { step: 'loading' }
  | { step: 'off' }
  | { step: 'enrolling'; factorId: string; qrCode: string; secret: string }
  | { step: 'on'; factorId: string };

export function TotpSettings() {
  const router = useRouter();
  const [state, setState] = useState<State>({ step: 'loading' });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const factorId = await verifiedTotpFactorId(createSupabaseBrowserClient());
    setState(factorId ? { step: 'on', factorId } : { step: 'off' });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function enroll() {
    setPending(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    await removeUnverifiedFactors(supabase);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator',
    });
    setPending(false);
    if (error || !data) return setError('Gagal memulai pengaturan. Coba lagi.');
    setState({
      step: 'enrolling',
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.step !== 'enrolling') return;
    const code = totpCodeSchema.safeParse(new FormData(event.currentTarget).get('code'));
    if (!code.success) return setError(code.error.issues[0]?.message ?? null);

    setPending(true);
    const { error } = await createSupabaseBrowserClient().auth.mfa.challengeAndVerify({
      factorId: state.factorId,
      code: code.data,
    });
    setPending(false);
    if (error) return setError('Kode salah. Pastikan jam di HP-mu tepat, lalu coba kode terbaru.');
    setError(null);
    setState({ step: 'on', factorId: state.factorId });
    router.refresh();
  }

  async function disable() {
    if (state.step !== 'on') return;
    setPending(true);
    const { error } = await createSupabaseBrowserClient().auth.mfa.unenroll({
      factorId: state.factorId,
    });
    setPending(false);
    if (error) return setError('Gagal menonaktifkan. Masuk ulang dengan kode 2FA, lalu coba lagi.');
    setState({ step: 'off' });
    router.refresh();
  }

  return (
    <section className="glass card stack">
      <div>
        <h2>Verifikasi 2 langkah</h2>
        <p className="muted">
          {state.step === 'on'
            ? 'Aktif. Kode dari aplikasi authenticator diminta setiap kali masuk.'
            : 'Lindungi akun keuanganmu dengan kode dari aplikasi authenticator.'}
        </p>
      </div>
      {error && <Notice tone="error">{error}</Notice>}

      {state.step === 'off' && (
        <Button variant="primary" onClick={enroll} disabled={pending}>
          Aktifkan
        </Button>
      )}

      {state.step === 'enrolling' && (
        <form onSubmit={confirm} className="stack" noValidate>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.qrCode}
            alt="Kode QR untuk aplikasi authenticator"
            width={180}
            height={180}
          />
          <p className="muted">
            Pindai dengan Google Authenticator, 1Password, atau aplikasi sejenis. Tidak bisa
            memindai? Masukkan kunci ini: <code>{state.secret}</code>
          </p>
          <Field
            label="Kode 6 angka"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="input--code"
            required
          />
          <Button type="submit" variant="primary" disabled={pending}>
            Verifikasi
          </Button>
        </form>
      )}

      {state.step === 'on' && (
        <Button variant="ghost" onClick={disable} disabled={pending}>
          Nonaktifkan
        </Button>
      )}
    </section>
  );
}
