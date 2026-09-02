import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, KeyRound, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Logo } from '../../components/ui/Logo';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { SimpleThemeToggle } from '../../components/ui/ThemeToggle';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [hasPrefilledCode, setHasPrefilledCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get('code');
    const emailParam = searchParams.get('email');

    if (codeParam) {
      setInvitationCode(codeParam.toUpperCase());
      setHasPrefilledCode(true);
    }
    if (emailParam) {
      setEmail(emailParam.toLowerCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !invitationCode) {
      setError('Por favor completa todos los campos requeridos, incluyendo el código de invitación.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.register({
        name,
        email,
        password,
        invitationCode: invitationCode.trim().toUpperCase(),
      });
      setAuth(res.user, res.accessToken, res.tenants);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'No se pudo completar el registro. Verifica que el código de invitación sea válido y coincida con tu email.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Logo size="lg" />
        <SimpleThemeToggle />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <Card variant="glass" padding="lg" className="border-violet-200/60 dark:border-violet-800/30">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/40 mb-3">
              <Sparkles size={12} />
              Registro Exclusivo por Invitación
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">
              Crear tu cuenta
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Únete al equipo e ingresa al ecosistema Aurea Pages.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Código de Invitación
                </label>
                {hasPrefilledCode && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 size={11} />
                    Invitación cargada
                  </span>
                )}
              </div>
              <Input
                type="text"
                placeholder="AUR-XXXXX"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                leftIcon={<KeyRound size={16} />}
                required
              />
            </div>

            <Input
              label="Nombre Completo"
              type="text"
              placeholder="Federico Méndez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<UserIcon size={16} />}
              required
            />

            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="tu@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              Crear Cuenta & Acceder
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-[#12131e] px-2 text-zinc-400">
                o también puedes
              </span>
            </div>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL || 'https://aurea-backoffice-be.onrender.com/api'}/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all shadow-xs active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Acceder con Google
          </a>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-bold text-violet-600 dark:text-violet-400 hover:underline"
            >
              Inicia sesión
            </Link>
          </div>
        </Card>
      </div>

      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-zinc-400 dark:text-zinc-600 z-10">
        © {new Date().getFullYear()} Aurea Pages · Plataforma Multitenant
      </footer>
    </div>
  );
}
