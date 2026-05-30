import { handleOptions, corsResponse, getUserFromRequest, getServiceClient } from '../_shared/auth.ts';
import { claimSetupToken, fetchAccounts, normalizeAccountsResponse } from '../_shared/simplefin.ts';

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return corsResponse({ error: 'Method not allowed' }, 405);

  try {
    const user = await getUserFromRequest(req);
    const { setupToken } = await req.json();
    if (!setupToken) return corsResponse({ error: 'setupToken required' }, 400);

    const accessUrl = await claimSetupToken(setupToken);
    const admin = getServiceClient();
    const { error } = await admin.from('bank_links').upsert({
      user_id: user.id,
      access_url: accessUrl,
      created_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    const raw = await fetchAccounts(accessUrl);
    const normalized = normalizeAccountsResponse(raw as Record<string, unknown>);
    return corsResponse({ ok: true, ...normalized });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'Unauthorized' ? 401 : 400;
    return corsResponse({ error: msg }, status);
  }
});
