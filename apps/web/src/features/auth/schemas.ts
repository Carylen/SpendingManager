import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Masukkan email yang valid.'),
  password: z.string().min(1, 'Masukkan kata sandi.'),
});

export const signUpSchema = z.object({
  displayName: z.string().trim().min(1, 'Masukkan nama.').max(80, 'Nama maksimal 80 karakter.'),
  email: z.email('Masukkan email yang valid.'),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter.')
    .max(72, 'Kata sandi maksimal 72 karakter.'),
});

export const totpCodeSchema = z.string().regex(/^\d{6}$/, 'Kode terdiri dari 6 angka.');

export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return Object.fromEntries(error.issues.map((issue) => [String(issue.path[0]), issue.message]));
}
