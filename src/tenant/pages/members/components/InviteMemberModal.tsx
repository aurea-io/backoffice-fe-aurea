import React, { useState } from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/Dialog';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import type { Role } from '../../../../types';
import { useTenantStore } from '../../../../store/tenantStore';
import { ROLE_PRESETS } from '../presets.config';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: Role, permissions?: string[]) => Promise<void>;
}

export function InviteMemberModal({
  isOpen,
  onClose,
  onInvite,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTenant } = useTenantStore();
  const presets = ROLE_PRESETS[currentTenant?.vertical || 'general'] || ROLE_PRESETS.general;
  const selectedPreset = presets.find((preset) => preset.role === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor ingresa el correo del usuario.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onInvite(email.trim(), role, selectedPreset?.permissions);
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'No se pudo vincular al usuario. Verifica que el correo esté registrado.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const roleDescriptions: Record<Role, string> = {
    SUPERADMIN: 'Acceso global a toda la infraestructura Aurea.',
    OWNER: 'Control total de facturación, ajustes, equipo y catálogo.',
    MANAGER: 'Gestión operativa, administración de catálogo y turnos.',
    STAFF: 'Visualización de pedidos, reservas y atención al cliente.',
    CASHIER: 'Cobro de pedidos y emisión de comprobantes en caja.',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar Miembro al Equipo</DialogTitle>
          <DialogDescription>
            Concede acceso a tu comercio con un rol y permisos específicos.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <Input
            label="Correo Electrónico"
            type="email"
            placeholder="colaborador@negocio.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail size={16} />}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Rol Asignado
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-white dark:bg-[#12131e] text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500"
            >
              <option value="STAFF">Staff (Atención & Turnos)</option>
              <option value="MANAGER">Manager (Administrador Operativo)</option>
              <option value="CASHIER">Cajero (Caja & Pedidos)</option>
              <option value="OWNER">Owner (Dueño / Socio)</option>
            </select>
            <p className="text-[11px] text-zinc-400 mt-1">
              {roleDescriptions[role]}
            </p>
            {selectedPreset && <p className="text-[11px] text-violet-600 dark:text-violet-400 mt-1">Preset: {selectedPreset.label} · {selectedPreset.permissions.join(', ')}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<ShieldCheck size={14} />}
            >
              Asignar Acceso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
