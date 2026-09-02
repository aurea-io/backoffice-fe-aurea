import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { superadminService } from '../../../services/superadmin.service';
import type { Tenant, FeatureKey } from '../../../types';
import {
  UtensilsCrossed,
  Sparkles,
  Layers,
  Calendar,
  Truck,
  Grid,
  Star,
  Globe,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface FeatureOption {
  key: FeatureKey;
  name: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ALL_FEATURES: FeatureOption[] = [
  {
    key: 'catalog',
    name: 'Catálogo / Menú',
    description: 'Permite crear items, gestionar precios, categorías e imágenes.',
    badge: 'Base',
    icon: UtensilsCrossed,
  },
  {
    key: 'bookings',
    name: 'Turnos & Agenda',
    description: 'Sistema de turnos online con horarios y profesionales.',
    badge: 'Belleza / Salud',
    icon: Calendar,
  },
  {
    key: 'tables',
    name: 'Mesas & Salón',
    description: 'Gestión de salón y pedidos por mesa con comanda.',
    badge: 'Gastronomía',
    icon: Grid,
  },
  {
    key: 'delivery',
    name: 'Delivery & Retiro',
    description: 'Carrito de compras con cálculo de envío y pedidos.',
    badge: 'Comercio',
    icon: Truck,
  },
  {
    key: 'social_hub',
    name: 'Social Hub & NFC',
    description: 'Landing bio-link para redes y cartas digitales.',
    badge: 'Marketing',
    icon: Globe,
  },
  {
    key: 'reviews',
    name: 'Reseñas & Puntuaciones',
    description: 'Calificaciones y feedback de clientes en el frontend.',
    badge: 'Fidelización',
    icon: Star,
  },
];

interface TenantModulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onSaved: () => Promise<void>;
}

export function TenantModulesModal({
  isOpen,
  onClose,
  tenant,
  onSaved,
}: TenantModulesModalProps) {
  const [activeFeatures, setActiveFeatures] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    const map: Record<string, boolean> = {};
    ALL_FEATURES.forEach((f) => {
      map[f.key] = false;
    });
    if (tenant.features) {
      tenant.features.forEach((tf) => {
        map[tf.featureKey] = tf.isEnabled;
      });
    }
    setActiveFeatures(map);
    setSuccessMessage(null);
  }, [tenant, isOpen]);

  const handleToggle = (key: string) => {
    setActiveFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!tenant) return;
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const payload = Object.entries(activeFeatures).map(([featureKey, isEnabled]) => ({
        featureKey,
        isEnabled,
      }));

      await superadminService.batchAssignFeatures(tenant.id, payload);
      setSuccessMessage('¡Módulos actualizados con éxito!');
      await onSaved();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar módulos');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Layers size={22} />
            </div>
            <div>
              <DialogTitle>Módulos de {tenant.name}</DialogTitle>
              <DialogDescription>
                Habilitá o desactivá funcionalidades para este comercio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {ALL_FEATURES.map((feat) => {
            const isEnabled = !!activeFeatures[feat.key];
            const Icon = feat.icon;

            return (
              <div
                key={feat.key}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isEnabled
                        ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {feat.name}
                      </p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {feat.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(feat.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<ShieldCheck size={15} />}
          >
            Guardar Módulos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
