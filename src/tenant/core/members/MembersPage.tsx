import { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, MoreVertical, Save, UserX } from 'lucide-react';
import { useTenantStore } from '../../../store/tenantStore';
import { tenantService } from '../../../services/tenant.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { InviteMemberModal } from './components/InviteMemberModal';
import type { TenantMember, Role } from '../../../types';

export default function MembersPage() {
  const { currentTenant, activeTenantId } = useTenantStore();

  const [members, setMembers] = useState<TenantMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    if (!activeTenantId) return;
    setIsLoading(true);
    try {
      const data = await tenantService.getMembers();
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeTenantId]);

  const handleInvite = async (email: string, role: Role, permissions?: string[]) => {
    await tenantService.addMember(email, role, permissions);
    await fetchMembers();
  };

  const updateMember = async (member: TenantMember, input: Parameters<typeof tenantService.updateMember>[1]) => {
    setSavingId(member.userId);
    try { await tenantService.updateMember(member.userId, input); await fetchMembers(); }
    finally { setSavingId(null); }
  };

  const removeMember = async (member: TenantMember) => {
    if (!window.confirm(`¿Quitar a ${member.user?.name || member.user?.email} de este comercio?`)) return;
    setSavingId(member.userId);
    try { await tenantService.removeMember(member.userId); await fetchMembers(); }
    finally { setSavingId(null); }
  };

  const roleBadges: Record<Role, { variant: 'violet' | 'emerald' | 'amber' | 'zinc'; label: string }> = {
    OWNER: { variant: 'violet', label: 'Owner / Dueño' },
    MANAGER: { variant: 'emerald', label: 'Manager' },
    STAFF: { variant: 'amber', label: 'Staff' },
    CASHIER: { variant: 'zinc', label: 'Cajero' },
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            Control de Accesos
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Equipo & Colaboradores
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Gestiona los roles y permisos del personal asignado a{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{currentTenant?.name}</strong>.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsInviteOpen(true)}
          leftIcon={<UserPlus size={16} />}
        >
          Invitar Miembro
        </Button>
      </div>

      {/* Members List Table / Cards */}
      <Card variant="glass" padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="py-16">
            <LoadingSpinner size="lg" label="Cargando equipo de trabajo..." />
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {members.map((member) => {
              const badgeInfo = roleBadges[member.role] || { variant: 'zinc', label: member.role };
              return (
                <div
                  key={member.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                      {member.user?.avatarUrl ? (
                        <img
                          src={member.user.avatarUrl}
                          alt={member.user.name}
                          className="w-full h-full rounded-2xl object-cover"
                        />
                      ) : member.user?.name ? (
                        member.user.name.slice(0, 2).toUpperCase()
                      ) : (
                        'U'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
                          {member.user?.name || 'Usuario'}
                        </h4>
                        <Badge variant={badgeInfo.variant} size="sm">
                          {badgeInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="text-zinc-400" />
                        <span>{member.user?.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <select
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                      value={member.role}
                      disabled={member.role === 'OWNER' || savingId === member.userId}
                      onChange={(event) => updateMember(member, { role: event.target.value as Role })}
                      aria-label={`Rol de ${member.user?.name || member.user?.email}`}
                    >
                      <option value="MANAGER">Manager</option><option value="STAFF">Staff</option><option value="CASHIER">Cajero</option>
                    </select>
                    <Badge variant={member.isActive ? 'emerald' : 'zinc'} size="sm" dot={member.isActive}>
                      {member.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                    <Button variant="ghost" size="icon" disabled={savingId === member.userId} onClick={() => updateMember(member, { isActive: !member.isActive })} title={member.isActive ? 'Suspender acceso' : 'Activar acceso'}>
                      {member.isActive ? <UserX size={15} /> : <Save size={15} />}
                    </Button>
                    {member.role !== 'OWNER' && <Button variant="ghost" size="icon" disabled={savingId === member.userId} onClick={() => removeMember(member)} title="Quitar miembro"><MoreVertical size={15} /></Button>}
                  </div>
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="p-8 text-center text-xs text-zinc-400">
                No hay miembros adicionales asignados a este negocio.
              </div>
            )}
          </div>
        )}
      </Card>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
