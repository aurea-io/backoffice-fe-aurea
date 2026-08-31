import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { SimpleThemeToggle } from '../../components/ui/ThemeToggle';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const { setActiveTenantId } = useTenantStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      setAuth(res.user, res.accessToken, res.tenants);

      if (res.tenants && res.tenants.length > 0) {
        setActiveTenantId(res.tenants[0].tenantId);
      }

      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Credenciales incorrectas o usuario no encontrado.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Ingresa tu correo para recibir un enlace de acceso rápido.');
      return;
    }

    setIsMagicLoading(true);
    setError(null);

    try {
      await authService.requestMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar enlace mágico.');
    } finally {
      setIsMagicLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 dark:bg-indigo-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Logo size="lg" />
        <SimpleThemeToggle />
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <Card variant="glass" padding="lg" className="border-violet-200/60 dark:border-violet-800/30">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/40 mb-3">
              <Sparkles size={12} />
              Acceso a Backoffice
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Gestiona tus catálogos, reservas y comercios en un solo lugar.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {magicLinkSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-zinc-900 dark:text-white">
                  ¡Enlace mágico enviado!
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Revisa la casilla de <strong>{email}</strong> para ingresar sin contraseña.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setMagicLinkSent(false)}
              >
                Volver al inicio de sesión tradicional
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="tu@negocio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={16} />}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Contraseña
                  </label>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={16} />}
              >
                Iniciar Sesión
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-[#12131e] px-2 text-zinc-400">
                    o continúa con
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/auth/google`}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-xs active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuar con Google
                </a>

                <Button
                  type="button"
                  variant="soft"
                  size="md"
                  className="w-full text-xs"
                  isLoading={isMagicLoading}
                  onClick={handleMagicLink}
                  leftIcon={<Sparkles size={14} />}
                >
                  Enviar Enlace Mágico por Email
                </Button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
            ¿Aún no tienes cuenta en Aurea?{' '}
            <Link
              to="/register"
              className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </Card>
      </div>

      {/* Footer info */}
      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-zinc-400 dark:text-zinc-600 z-10">
        © {new Date().getFullYear()} Aurea Pages · Plataforma Multitenant de Experiencias Digitales
      </footer>
    </div>
  );
}
