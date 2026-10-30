export type SearchParams = Record<string, string | string[] | undefined>;

export const firstParam = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export const listParam = (value: string | string[] | undefined): string[] =>
  (firstParam(value) ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const toSearchParams = (params: SearchParams): URLSearchParams => {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = firstParam(value);
    if (single !== undefined) result.set(key, single);
  }
  return result;
};
