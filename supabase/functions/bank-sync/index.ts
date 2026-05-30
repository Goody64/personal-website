import { handleOptions, corsResponse, getUserFromRequest, getServiceClient } from '../_shared/auth.ts';
import { fetchAccounts, normalizeAccountsResponse } from '../_shared/simplefin.ts';

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return corsResponse({ error: 'Method not allowed' }, 405);

  try {
    const user = await getUserFromRequest(req);
    const admin = getServiceClient();
    const { data: link, error } = await admin
      .from('bank_links')
      .select('access_url')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!link?.access_url) return corsResponse({ error: 'No bank connected' }, 404);

    // ~90 day window (SimpleFIN daily sync model)
    const startDate = Math.floor(Date.now() / 1000) - 90 * 86400;
    const raw = await fetchAccounts(link.access_url, startDate);
    const normalized = normalizeAccountsResponse(raw as Record<string, unknown>);

    await admin.from('bank_links').update({ last_synced: new Date().toISOString() }).eq('user_id', user.id);

    return corsResponse({ ok: true, lastSynced: new Date().toISOString(), ...normalized });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'Unauthorized' ? 401 : 400;
    return corsResponse({ error: msg }, status);
  }
});
