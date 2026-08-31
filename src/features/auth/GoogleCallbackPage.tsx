import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Logo } from '../../components/ui/Logo';
import { SimpleThemeToggle } from '../../components/ui/ThemeToggle';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { setActiveTenantId } = useTenantStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Falta el token de autenticación de Google.');
      return;
    }

    const finishLogin = async () => {
      try {
        const data = await authService.getMe();
        setAuth(data.user, token, data.allTenants);
        if (data.allTenants && data.allTenants.length > 0) {
          setActiveTenantId(data.allTenants[0].tenantId);
        }
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Error completando inicio con Google:', err);
        setError('No se pudo verificar el usuario con Google.');
      }
    };

    finishLogin();
  }, [searchParams, navigate, setAuth, setActiveTenantId]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Logo size="lg" />
        <SimpleThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <Card variant="glass" padding="lg" className="text-center border-violet-200/60 dark:border-violet-800/30">
          {error ? (
            <div className="space-y-4 py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <h2 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
                Error de Autenticación
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
              <Button
                variant="primary"
                size="md"
                className="w-full mt-4"
                onClick={() => navigate('/login', { replace: true })}
              >
                Volver a Iniciar Sesión
              </Button>
            </div>
          ) : (
            <div className="py-6">
              <LoadingSpinner size="lg" label="Validando credenciales con Google..." />
            </div>
          )}
        </Card>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center text-xs text-zinc-400 dark:text-zinc-500 py-2 z-10">
        &copy; {new Date().getFullYear()} Aurea Pages &middot; Plataforma Multitenant
      </div>
    </div>
  );
}
