export function normalizeSender(sender: string): string {
  const address = sender.match(/<([^>]+)>/)?.[1] ?? sender;
  return address.trim().toLowerCase();
}

export function isFromAny(sender: string, allowed: readonly string[]): boolean {
  const address = normalizeSender(sender);
  const domain = address.split('@')[1] ?? '';
  return allowed.some((entry) => {
    const rule = entry.toLowerCase();
    return rule.startsWith('@')
      ? domain === rule.slice(1) || domain.endsWith(`.${rule.slice(1)}`)
      : address === rule;
  });
}
