import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { SimpleThemeToggle } from '../../components/ui/ThemeToggle';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al solicitar el restablecimiento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-[#090a0f] text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-10">
        <Logo size="lg" />
        <SimpleThemeToggle />
      </div>

      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <Card variant="glass" padding="lg" className="border-violet-200/60 dark:border-violet-800/30">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Volver a iniciar sesión
          </Link>

        {isSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="font-editorial text-2xl font-semibold text-zinc-900 dark:text-white">
              Correo enviado
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              Si la cuenta existe, recibirás las instrucciones para restablecer tu contraseña en <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="font-editorial text-2xl font-semibold text-zinc-900 dark:text-white">
                Recuperar contraseña
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Ingresa tu correo para recibir un enlace de recuperación.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={16} />}
              >
                Enviar Instrucciones
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
