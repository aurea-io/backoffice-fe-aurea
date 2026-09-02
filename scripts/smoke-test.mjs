const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
const apiUrl = process.env.API_URL?.replace(/\/$/, '');
const publicId = process.env.PUBLIC_ID;

if (!frontendUrl) throw new Error('FRONTEND_URL is required');

async function expectOk(url, label) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${label} returned ${response.status}: ${url}`);
  return response;
}

await expectOk(`${frontendUrl}/login`, 'login page');

if (publicId) {
  await expectOk(`${frontendUrl}/public/${encodeURIComponent(publicId)}`, 'public tenant page');
}

if (apiUrl && publicId) {
  const bootstrap = await expectOk(`${apiUrl}/bootstrap/${encodeURIComponent(publicId)}`, 'public bootstrap');
  const payload = await bootstrap.json();
  if (payload.publicId !== publicId) throw new Error(`bootstrap returned an unexpected publicId: ${payload.publicId}`);
  await expectOk(`${apiUrl}/style/${encodeURIComponent(publicId)}.css?v=${payload.version ?? 0}`, 'published theme');
  await expectOk(`${apiUrl}/public/${encodeURIComponent(publicId)}/catalog`, 'public catalog');
}

console.log(JSON.stringify({ ok: true, frontendUrl, apiUrl: apiUrl ?? null, publicId: publicId ?? null }));
