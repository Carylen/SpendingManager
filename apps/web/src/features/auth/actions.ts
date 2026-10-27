'use server';

import { redirect } from 'next/navigation';
import { appConfig } from '@/config/app';
import { publicEnv } from '@/lib/env';
import { safeNextPath } from '@/lib/auth/redirect';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { fieldErrors, signInSchema, signUpSchema, type FieldErrors } from './schemas';

export interface FormState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const values = { email: text(form, 'email') };
  const parsed = signInSchema.safeParse({ ...values, password: text(form, 'password') });
  if (!parsed.success) return { status: 'error', errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const message =
      error.code === 'email_not_confirmed'
        ? 'Email belum dikonfirmasi. Cek kotak masuk emailmu.'
        : 'Email atau kata sandi salah.';
    return { status: 'error', message, values };
  }

  const next = safeNextPath(form.get('next'), appConfig.homePath);
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.nextLevel === 'aal2' && data.currentLevel === 'aal1') {
    redirect(`${appConfig.mfaPath}?next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const values = { displayName: text(form, 'displayName'), email: text(form, 'email') };
  const parsed = signUpSchema.safeParse({ ...values, password: text(form, 'password') });
  if (!parsed.success) return { status: 'error', errors: fieldErrors(parsed.error), values };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${publicEnv().siteUrl}/auth/callback`,
    },
  });

  if (error) {
    const message =
      error.code === 'weak_password'
        ? 'Kata sandi terlalu mudah ditebak. Coba gabungkan huruf, angka, dan simbol.'
        : 'Pendaftaran gagal. Coba lagi sebentar lagi.';
    return { status: 'error', message, values };
  }

  return {
    status: 'success',
    message: `Kami mengirim tautan konfirmasi ke ${parsed.data.email}. Buka tautan itu untuk mengaktifkan akun.`,
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(appConfig.signInPath);
}
