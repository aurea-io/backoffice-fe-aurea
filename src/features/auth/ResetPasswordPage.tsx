import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { SimpleThemeToggle } from '../../components/ui/ThemeToggle';
import { authService } from '../../services/auth.service';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Token de recuperación no válido o ausente.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'No se pudo actualizar la contraseña. El token pudo haber expirado.',
      );
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

      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <Card variant="glass" padding="lg" className="border-violet-200/60 dark:border-violet-800/30">
        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="font-editorial text-2xl font-semibold text-zinc-900 dark:text-white">
              Contraseña restablecida
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Button
              variant="primary"
              size="md"
              className="w-full mt-4"
              onClick={() => navigate('/login')}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="font-editorial text-2xl font-semibold text-zinc-900 dark:text-white">
                Nueva Contraseña
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Ingresa una contraseña segura para tu cuenta.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />

              <Input
                label="Confirmar Contraseña"
                type="password"
                placeholder="Repite la nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={16} />}
              >
                Actualizar Contraseña
              </Button>
            </form>
          </div>
        )}
        </Card>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center text-xs text-zinc-400 dark:text-zinc-500 py-2 z-10">
        &copy; {new Date().getFullYear()} Aurea Pages &middot; Plataforma Multitenant de Experiencias Digitales
      </div>
    </div>
  );
}
