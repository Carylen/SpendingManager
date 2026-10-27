export type ProviderKind = 'bank' | 'ewallet' | 'cash';

export interface Provider {
  id: string;
  name: string;
  kind: ProviderKind;
}

export const PROVIDERS = [
  { id: 'bca', name: 'BCA', kind: 'bank' },
  { id: 'mandiri', name: 'Mandiri', kind: 'bank' },
  { id: 'ocbc', name: 'OCBC', kind: 'bank' },
  { id: 'bri', name: 'BRI', kind: 'bank' },
  { id: 'gopay', name: 'GoPay', kind: 'ewallet' },
  { id: 'shopeepay', name: 'ShopeePay', kind: 'ewallet' },
  { id: 'dana', name: 'DANA', kind: 'ewallet' },
  { id: 'cash', name: 'Tunai', kind: 'cash' },
] as const satisfies readonly Provider[];

export type ProviderId = (typeof PROVIDERS)[number]['id'];

export function findProvider(id: string): Provider | undefined {
  return PROVIDERS.find((provider) => provider.id === id);
}
