import { handleOptions, corsResponse, getUserFromRequest, getServiceClient } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  const opt = handleOptions(req);
  if (opt) return opt;
  if (req.method !== 'POST') return corsResponse({ error: 'Method not allowed' }, 405);

  try {
    const user = await getUserFromRequest(req);
    const admin = getServiceClient();
    const { error } = await admin.from('bank_links').delete().eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return corsResponse({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    const status = msg === 'Unauthorized' ? 401 : 400;
    return corsResponse({ error: msg }, status);
  }
});
