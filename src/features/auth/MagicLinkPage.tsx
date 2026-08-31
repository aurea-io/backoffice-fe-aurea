import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';

export default function MagicLinkPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { setAuth } = useAuthStore();
  const { setActiveTenantId } = useTenantStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No se proporcionó un token de acceso válido.');
      setIsLoading(false);
      return;
    }

    async function verify() {
      try {
        const res = await authService.verifyMagicLink(token!);
        setAuth(res.user, res.accessToken, res.tenants);
        if (res.tenants && res.tenants.length > 0) {
          setActiveTenantId(res.tenants[0].tenantId);
        }
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'El enlace mágico es inválido o ha expirado.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    verify();
  }, [token, setAuth, setActiveTenantId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-[#090a0f] p-4">
      <Card variant="glass" padding="lg" className="w-full max-w-md text-center">
        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner size="lg" label="Validando acceso seguro..." />
          </div>
        ) : error ? (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <AlertCircle size={24} />
            </div>
            <h2 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
              Enlace no válido
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{error}</p>
            <Button variant="primary" size="md" className="w-full mt-4" onClick={() => navigate('/login')}>
              Ir a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
              ¡Autenticación exitosa!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Redirigiendo a tu espacio de trabajo...
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
