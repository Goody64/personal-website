/** Parse SimpleFIN Access URL (https://user:pass@host/path) into fetch parts */
export function parseAccessUrl(accessUrl: string): { url: string; username: string; password: string } {
  const trimmed = accessUrl.trim();
  const match = trimmed.match(/^(https?):\/\/([^@]+)@([^/]+)(\/.*)?$/i);
  if (!match) throw new Error('Invalid SimpleFIN access URL');
  const [, scheme, auth, host, path = ''] = match;
  const colon = auth.indexOf(':');
  if (colon < 0) throw new Error('Invalid SimpleFIN access URL credentials');
  const username = decodeURIComponent(auth.slice(0, colon));
  const password = decodeURIComponent(auth.slice(colon + 1));
  return { url: `${scheme}://${host}${path}`, username, password };
}

export async function claimSetupToken(setupToken: string): Promise<string> {
  let claimUrl: string;
  try {
    claimUrl = atob(setupToken.trim());
  } catch {
    throw new Error('Invalid setup token (not valid base64)');
  }
  const res = await fetch(claimUrl, { method: 'POST', headers: { 'Content-Length': '0' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to claim token (${res.status})`);
  }
  const accessUrl = (await res.text()).trim();
  if (!accessUrl.startsWith('http')) throw new Error('Invalid access URL from SimpleFIN');
  return accessUrl;
}

export async function fetchAccounts(accessUrl: string, startDate?: number): Promise<unknown> {
  const { url, username, password } = parseAccessUrl(accessUrl);
  const accountsUrl = url.replace(/\/$/, '') + '/accounts';
  const params = new URLSearchParams({ version: '2' });
  if (startDate != null) params.set('start-date', String(startDate));
  const auth = btoa(`${username}:${password}`);
  const res = await fetch(`${accountsUrl}?${params}`, {
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error || res.statusText;
    throw new Error(msg || `SimpleFIN error (${res.status})`);
  }
  return data;
}

/** Normalize SimpleFIN v2 response for the client */
export function normalizeAccountsResponse(data: Record<string, unknown>) {
  const rawAccounts = (data.accounts as Record<string, unknown>[]) || [];
  return {
    accounts: rawAccounts.map((a) => ({
      id: String(a.id || ''),
      name: String(a.name || 'Account'),
      balance: parseFloat(String(a.balance ?? 0)) || 0,
      org: a.org || null,
      transactions: ((a.transactions as Record<string, unknown>[]) || []).map((t) => ({
        id: String(t.id || `${t.posted}-${t.amount}-${t.description}`),
        posted: t.posted ? new Date(Number(t.posted) * 1000).toISOString().slice(0, 10) : '',
        amount: parseFloat(String(t.amount ?? 0)) || 0,
        description: String(t.description || t.payee || ''),
        payee: String(t.payee || ''),
      })),
    })),
  };
}
