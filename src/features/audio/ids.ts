export function nanoid() {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  return Math.random().toString(36).slice(2, 12);
}
