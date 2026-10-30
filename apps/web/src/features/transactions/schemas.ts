import { MAX_RUPIAH, PROVIDERS, isIsoDay } from '@arus/core';
import { z } from 'zod';

const providerIds = PROVIDERS.map((provider) => provider.id) as [string, ...string[]];
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

export const newTransactionSchema = z.object({
  direction: z.enum(['in', 'out']),
  amount: z.coerce
    .number({ error: 'Isi nominal dulu sebelum menyimpan.' })
    .int()
    .min(1, 'Isi nominal dulu sebelum menyimpan.')
    .max(MAX_RUPIAH, 'Nominal terlalu besar.'),
  merchant: optionalText(120),
  categoryId: z.uuid().nullable().catch(null),
  providerId: z.enum(providerIds, { error: 'Pilih sumber dana.' }),
  day: z.string().refine(isIsoDay, 'Pilih tanggal transaksi.'),
  note: optionalText(500),
});

export type NewTransaction = z.infer<typeof newTransactionSchema>;
