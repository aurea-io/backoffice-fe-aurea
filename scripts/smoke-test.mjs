const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
const apiUrl = process.env.API_URL?.replace(/\/$/, '');
const publicId = process.env.PUBLIC_ID;

if (!frontendUrl) throw new Error('FRONTEND_URL is required');

async function expectOk(url, label, init = {}) {
  let response;
  try {
    response = await fetch(url, {
      ...init,
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new Error(`${label} timed out after 15 seconds: ${url}`);
    }
    throw error;
  }
  if (!response.ok) throw new Error(`${label} returned ${response.status}: ${url}`);
  return response;
}

function assertCors(response, label, frontendOrigin) {
  const allowedOrigin = response.headers.get('access-control-allow-origin');
  const allowsCredentials = response.headers.get('access-control-allow-credentials');
  if (allowedOrigin !== frontendOrigin || allowsCredentials?.toLowerCase() !== 'true') {
    throw new Error(
      `${label} has invalid CORS headers: origin=${allowedOrigin ?? 'missing'}, credentials=${allowsCredentials ?? 'missing'}`,
    );
  }
}

await expectOk(`${frontendUrl}/login`, 'login page');

if (publicId) {
  await expectOk(`${frontendUrl}/public/${encodeURIComponent(publicId)}`, 'public tenant page');
}

if (apiUrl && publicId) {
  const frontendOrigin = new URL(frontendUrl).origin;
  const apiOrigin = new URL(apiUrl).origin;
  const crossOrigin = frontendOrigin !== apiOrigin;
  const bootstrapUrl = `${apiUrl}/bootstrap/${encodeURIComponent(publicId)}`;
  const bootstrap = await expectOk(bootstrapUrl, 'public bootstrap', crossOrigin ? { headers: { Origin: frontendOrigin } } : {});
  if (crossOrigin) {
    assertCors(bootstrap, 'public bootstrap', frontendOrigin);
    const preflight = await expectOk(bootstrapUrl, 'public bootstrap preflight', {
      method: 'OPTIONS',
      headers: {
        Origin: frontendOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    assertCors(preflight, 'public bootstrap preflight', frontendOrigin);
  }
  const payload = await bootstrap.json();
  if (payload.publicId !== publicId) throw new Error(`bootstrap returned an unexpected publicId: ${payload.publicId}`);
  await expectOk(`${apiUrl}/style/${encodeURIComponent(publicId)}.css?v=${payload.version ?? 0}`, 'published theme');
  await expectOk(`${apiUrl}/public/${encodeURIComponent(publicId)}/catalog`, 'public catalog');
}

console.log(JSON.stringify({ ok: true, frontendUrl, apiUrl: apiUrl ?? null, publicId: publicId ?? null }));
