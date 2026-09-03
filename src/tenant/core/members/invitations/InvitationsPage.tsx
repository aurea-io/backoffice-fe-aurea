import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  UserPlus,
  Copy,
  Check,
  Trash2,
  Share2,
  Clock,
  CheckCircle,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Mail,
  Shield,
} from 'lucide-react';
import { invitationsService } from '../../../../services/invitations.service';
import { useAuthStore } from '../../../../store/authStore';
import { useTenantStore } from '../../../../store/tenantStore';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { EmptyState } from '../../../../components/common/EmptyState';
import type { Invitation, Role } from '../../../../types';

export default function InvitationsPage() {
  const { user } = useAuthStore();
  const { currentTenant } = useTenantStore();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [daysValid, setDaysValid] = useState(7);

  // Newly created highlight
  const [newlyCreated, setNewlyCreated] = useState<Invitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await invitationsService.findAll();
      setInvitations(list);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar las invitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.tenantId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const created = await invitationsService.create({
        email: email.trim().toLowerCase(),
        role,
        daysValid,
        tenantId: currentTenant?.tenantId,
      });

      setNewlyCreated(created);
      setEmail('');
      setSuccessMsg(`¡Invitación generada con éxito para ${created.email}!`);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al generar la invitación';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas revocar esta invitación pendiente?')) return;
    try {
      await invitationsService.revoke(id);
      loadData();
      if (newlyCreated?.id === id) {
        setNewlyCreated(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al revocar la invitación');
    }
  };

  const getRegisterLink = (inv: Invitation) => {
    const origin = window.location.origin;
    return `${origin}/register?code=${inv.code}&email=${encodeURIComponent(inv.email)}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const shareWhatsApp = (inv: Invitation) => {
    const link = getRegisterLink(inv);
    const tenantName = currentTenant?.name || 'Aurea Pages';
    const msg = `¡Hola! Te invito a unirte a ${tenantName} en Aurea Pages.\n\nAccedé a tu registro con este link directo:\n${link}\n\n(Tu código de invitación: ${inv.code})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const getStatusBadge = (inv: Invitation) => {
    const isExpired = new Date(inv.expiresAt) < new Date();
    if (inv.used) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <CheckCircle size={12} />
          Registrado
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          <Clock size={12} />
          Expirado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Pendiente
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/40">
              <KeyRound size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-editorial">
                Generador de Invitaciones & Accesos
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Crea códigos exclusivos para sumar miembros con roles asignados a{' '}
                <strong className="text-zinc-800 dark:text-zinc-200">
                  {currentTenant?.name || 'la plataforma'}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          disabled={loading}
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
        >
          Actualizar
        </Button>
      </div>

      {/* Generator Form */}
      <Card variant="glass" padding="lg" className="border-violet-200/60 dark:border-violet-800/30 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Generar Nuevo Código de Invitación
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Correo Electrónico del Invitado"
              type="email"
              placeholder="nuevo.socio@negocio.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Rol Asignado
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#13141f] border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="STAFF">STAFF (Personal)</option>
              <option value="CASHIER">CASHIER (Cajero/Ventas)</option>
              <option value="MANAGER">MANAGER (Gerente)</option>
              <option value="OWNER">OWNER (Propietario)</option>
              {user?.isAureaSuperadmin && <option value="SUPERADMIN">SUPERADMIN (Global)</option>}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Validez
            </label>
            <select
              value={daysValid}
              onChange={(e) => setDaysValid(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#13141f] border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value={3}>3 días</option>
              <option value={7}>7 días</option>
              <option value={14}>14 días</option>
              <option value={30}>30 días</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={submitting}
              leftIcon={<UserPlus size={15} />}
            >
              Generar
            </Button>
          </div>
        </form>

        {/* Highlight Newly Generated Invitation Card */}
        {newlyCreated && (
          <div className="mt-6 p-4 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                  Código Generado:
                </span>
                <span className="font-mono text-sm font-extrabold text-violet-900 dark:text-violet-100 bg-white dark:bg-violet-900/60 px-2.5 py-0.5 rounded-lg border border-violet-300 dark:border-violet-700 shadow-xs">
                  {newlyCreated.code}
                </span>
                <Badge variant="violet" size="sm">
                  {newlyCreated.role}
                </Badge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Asignado a: <strong>{newlyCreated.email}</strong> &middot; Expira el{' '}
                {new Date(newlyCreated.expiresAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => copyToClipboard(getRegisterLink(newlyCreated), newlyCreated.id)}
                leftIcon={
                  copiedId === newlyCreated.id ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )
                }
              >
                {copiedId === newlyCreated.id ? '¡Copiado!' : 'Copiar Link Directo'}
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => shareWhatsApp(newlyCreated)}
                leftIcon={<Share2 size={14} />}
              >
                Enviar por WhatsApp
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Invitations History Table */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Historial de Invitaciones ({invitations.length})
        </h2>

        {loading ? (
          <Card variant="default" padding="lg">
            <LoadingSpinner size="md" label="Cargando invitaciones..." />
          </Card>
        ) : invitations.length === 0 ? (
          <EmptyState
            icon={<KeyRound size={28} className="text-violet-500" />}
            title="Sin invitaciones creadas"
            description="Genera el primer código de acceso arriba para invitar a miembros de tu equipo."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs bg-white dark:bg-[#10111a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Invitado / Email</th>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Rol Asignado</th>
                  <th className="py-3 px-4">Expiración</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {invitations.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                      {inv.email}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-violet-700 dark:text-violet-400">
                      {inv.code}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="violet" size="sm">
                        {inv.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(inv)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {!inv.used && (
                        <>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(getRegisterLink(inv), inv.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Copiar enlace de registro"
                          >
                            {copiedId === inv.id ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => shareWhatsApp(inv)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Compartir por WhatsApp"
                          >
                            <Share2 size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRevoke(inv.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Revocar invitación"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
