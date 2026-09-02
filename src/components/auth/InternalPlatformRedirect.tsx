import { useEffect } from 'react';

const internalUrl = import.meta.env.VITE_INTERNAL_BACKOFFICE_URL ||
  'https://aurea-backoffice-internal-aurea-pages-template.vercel.app/platform/dashboard';

export function InternalPlatformRedirect() {
  useEffect(() => {
    window.location.replace(internalUrl);
  }, []);

  return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Abriendo el Backoffice interno de AUREA…</div>;
}
