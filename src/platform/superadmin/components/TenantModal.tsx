import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/Dialog';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { Tenant, FeatureKey } from '../../../types';
import type { CreateTenantPayload, UpdateTenantPayload } from '../../../services/superadmin.service';
import {
  UtensilsCrossed,
  Sparkles,
  Layers,
  Store,
  HeartPulse,
  Building,
  ShoppingBag,
  Check,
  PackageCheck,
  Share2,
  Copy,
  Calendar,
  Truck,
  Grid,
  Star,
  Globe,
  Plus,
} from 'lucide-react';

interface FeatureOption {
  key: FeatureKey;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const ALL_FEATURES: FeatureOption[] = [
  {
    key: 'catalog',
    name: 'Catálogo / Menú',
    description: 'Productos, precios, categorías y fotos',
    icon: UtensilsCrossed,
  },
  {
    key: 'bookings',
    name: 'Turnos & Agenda',
    description: 'Reservas online con fecha, hora y profesionales',
    icon: Calendar,
  },
  {
    key: 'tables',
    name: 'Mesas & Salón',
    description: 'Gestión de salón, comandas y pedidos en mesa',
    icon: Grid,
  },
  {
    key: 'delivery',
    name: 'Delivery & Retiro',
    description: 'Carrito de compras con cálculo de envío y pedidos',
    icon: Truck,
  },
  {
    key: 'social_hub',
    name: 'Social Hub & NFC',
    description: 'Landing bio-link y accesos directos por QR/NFC',
    icon: Globe,
  },
  {
    key: 'reviews',
    name: 'Reseñas de Clientes',
    description: 'Calificaciones y feedback en la web pública',
    icon: Star,
  },
];

interface VerticalOption {
  value: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultFeatures: FeatureKey[];
}

const VERTICAL_PRESETS: VerticalOption[] = [
  {
    value: 'gastronomy',
    label: 'Gastronomía',
    description: 'Restaurantes, bares, cafeterías y pizzerías',
    icon: UtensilsCrossed,
    defaultFeatures: ['catalog', 'tables', 'delivery', 'social_hub'],
  },
  {
    value: 'beauty',
    label: 'Belleza & Estética',
    description: 'Peluquerías, spas, barberías y centros de estética',
    icon: Sparkles,
    defaultFeatures: ['catalog', 'bookings', 'social_hub', 'reviews'],
  },
  {
    value: 'stock',
    label: 'Pastelería & Stock',
    description: 'Pastelerías, panaderías y locales de venta minorista',
    icon: ShoppingBag,
    defaultFeatures: ['catalog', 'delivery', 'social_hub'],
  },
  {
    value: 'health',
    label: 'Salud & Bienestar',
    description: 'Consultorios, kinesiólogos, nutrición y clínicas',
    icon: HeartPulse,
    defaultFeatures: ['catalog', 'bookings', 'reviews'],
  },
  {
    value: 'realestate',
    label: 'Inmobiliaria',
    description: 'Agencias de propiedades y alquileres',
    icon: Building,
    defaultFeatures: ['catalog', 'social_hub', 'reviews'],
  },
  {
    value: 'general',
    label: 'Comercio General',
    description: 'Negocios de servicios o retail general',
    icon: Store,
    defaultFeatures: ['catalog', 'social_hub'],
  },
];

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTenantPayload | UpdateTenantPayload) => Promise<Tenant>;
  tenantToEdit?: Tenant | null;
}

export function TenantModal({
  isOpen,
  onClose,
  onSave,
  tenantToEdit,
}: TenantModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [vertical, setVertical] = useState('gastronomy');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureKey[]>([
    'catalog',
    'tables',
    'delivery',
    'social_hub',
  ]);
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Invitation success screen
  const [createdTenantResult, setCreatedTenantResult] = useState<Tenant | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (tenantToEdit) {
      setName(tenantToEdit.name);
      setSlug(tenantToEdit.slug);
      setVertical(tenantToEdit.vertical);
      setIsActive(tenantToEdit.isActive);
      setOwnerEmail(
        tenantToEdit.memberships?.[0]?.user?.email ||
          tenantToEdit.invitations?.[0]?.email ||
          '',
      );
      setSelectedFeatures(
        tenantToEdit.features
          ? (tenantToEdit.features
              .filter((f) => f.isEnabled)
              .map((f) => f.featureKey as FeatureKey))
          : ['catalog'],
      );
    } else {
      setName('');
      setSlug('');
      setVertical('gastronomy');
      setIsActive(true);
      setOwnerEmail('');
      setSelectedFeatures(['catalog', 'tables', 'delivery', 'social_hub']);
    }
    setError(null);
    setCreatedTenantResult(null);
    setCopiedLink(false);
  }, [tenantToEdit, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!tenantToEdit) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleVerticalSelect = (vertValue: string) => {
    setVertical(vertValue);
    const preset = VERTICAL_PRESETS.find((p) => p.value === vertValue);
    if (preset) {
      setSelectedFeatures([...preset.defaultFeatures]);
    }
  };

  const toggleFeature = (featKey: FeatureKey) => {
    setSelectedFeatures((prev) =>
      prev.includes(featKey)
        ? prev.filter((k) => k !== featKey)
        : [...prev, featKey],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('El nombre y el slug del comercio son obligatorios.');
      return;
    }
    if (!tenantToEdit && !ownerEmail.trim()) {
      setError('El email del dueño es obligatorio para vincular o invitar al comercio.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (tenantToEdit) {
        await onSave({
          name: name.trim(),
          slug: slug.trim(),
          vertical,
          isActive,
        });
        onClose();
      } else {
        const res = await onSave({
          name: name.trim(),
          slug: slug.trim(),
          vertical,
          ownerEmail: ownerEmail.trim(),
          features: selectedFeatures,
        });

        // If an invitation was created, show the invitation share screen
        if (res?.invitation) {
          setCreatedTenantResult(res);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar el tenant.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Invitation link helpers
  const invitationCode = createdTenantResult?.invitation?.code || '';
  const registerLink = `${window.location.origin}/register?code=${invitationCode}&email=${encodeURIComponent(
    ownerEmail,
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(registerLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const msg = `¡Hola! Ya dimos de alta tu comercio *${name}* en Aurea Pages.\n\nAccedé a tu cuenta y activá tu panel con este enlace de registro:\n${registerLink}\n\n(Código de invitación: *${invitationCode}*)`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Modal view: Post-creation Invitation Card ────────────────────────────
  if (createdTenantResult && createdTenantResult.invitation) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <PackageCheck size={28} />
            </div>

            <div>
              <h3 className="font-editorial text-2xl font-bold text-zinc-900 dark:text-white">
                ¡Tenant Creado Exitosamente!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Se generó el código de invitación exclusivo para el dueño de <strong>{name}</strong>.
              </p>
            </div>

            {/* Invitation Code Display */}
            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  Código de Invitación
                </span>
                <span className="font-mono text-base font-bold text-violet-600 dark:text-violet-400 bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl border border-violet-200 dark:border-violet-800">
                  {invitationCode}
                </span>
              </div>

              <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                <p>
                  <strong>Destinatario:</strong> {ownerEmail}
                </p>
                <p>
                  <strong>Módulos activos:</strong> {selectedFeatures.length} habilitados
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={registerLink}
                  className="w-full bg-white dark:bg-zinc-900 text-xs font-mono px-3 py-2 rounded-xl border border-violet-200 dark:border-violet-800 text-zinc-700 dark:text-zinc-300 select-all"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopy}
                  leftIcon={copiedLink ? <Check size={14} /> : <Copy size={14} />}
                >
                  {copiedLink ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={handleShareWhatsApp}
                leftIcon={<Share2 size={16} />}
              >
                Compartir por WhatsApp
              </Button>
              <Button variant="primary" size="md" onClick={onClose}>
                Listo, Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Modal view: Create / Edit Form ───────────────────────────────────────
  const selectedPreset = VERTICAL_PRESETS.find((p) => p.value === vertical);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Store size={22} />
            </div>
            <div>
              <DialogTitle>
                {tenantToEdit ? 'Editar Tenant' : 'Crear Nuevo Tenant & Comercio'}
              </DialogTitle>
              <DialogDescription>
                Configurá el rubro, paquete de suscripción y titular del comercio.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Section 1: Business Identity */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              1. Datos del Comercio
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nombre Comercial"
                placeholder="Ej: De Santas Spa, Pizzería Roma..."
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />

              <Input
                label="Slug de URL (Identificador)"
                placeholder="desantas"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                helperText={`/preview/${slug || 'slug'}`}
                required
              />
            </div>
          </div>

          {/* Section 2: Vertical Presets (Packages) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                2. Rubro & Paquete de Suscripción
              </h4>
              <span className="text-[11px] text-violet-600 dark:text-violet-400 font-semibold">
                Paquete: {selectedPreset?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VERTICAL_PRESETS.map((preset) => {
                const isSelected = vertical === preset.value;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleVerticalSelect(preset.value)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-violet-50 dark:bg-violet-950/50 border-violet-500 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      {isSelected && <Check size={14} className="text-violet-600 dark:text-violet-400" />}
                    </div>

                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isSelected ? 'text-violet-900 dark:text-violet-200' : 'text-zinc-900 dark:text-white'
                        }`}
                      >
                        {preset.label}
                      </p>
                      <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {preset.defaultFeatures.length} módulos base
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Module Customization (Granular Toggles) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                3. Módulos & Funcionalidades Activas
              </h4>
              <span className="text-[11px] text-zinc-400">
                {selectedFeatures.length} de {ALL_FEATURES.length} módulos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_FEATURES.map((feat) => {
                const isChecked = selectedFeatures.includes(feat.key);
                const isDefaultInPreset = selectedPreset?.defaultFeatures.includes(feat.key);
                const Icon = feat.icon;

                return (
                  <div
                    key={feat.key}
                    onClick={() => toggleFeature(feat.key)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isChecked
                        ? 'bg-zinc-50 dark:bg-zinc-900/80 border-violet-500/60 dark:border-violet-500/40'
                        : 'bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg mt-0.5 shrink-0 ${
                          isChecked
                            ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {feat.name}
                          </p>
                          {isDefaultInPreset && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 shrink-0">
                              Paquete
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                          {feat.description}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent div
                      className="mt-1 w-4 h-4 rounded text-violet-600 focus:ring-violet-500 shrink-0 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Owner Email & Invitation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              4. Titular del Comercio
            </h4>
            <Input
              label="Email del Dueño / Titular"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              helperText={
                tenantToEdit
                  ? 'Email del titular registrado.'
                  : 'Si el usuario no está registrado, se le creará un Código de Invitación con rol OWNER.'
              }
              required={!tenantToEdit}
              disabled={!!tenantToEdit}
            />
          </div>

          {tenantToEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isTenantActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded-md border-zinc-300 focus:ring-violet-500"
              />
              <label
                htmlFor="isTenantActive"
                className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                Tenant activo en la plataforma
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {tenantToEdit ? 'Guardar Cambios' : 'Crear Tenant & Generar Invitación'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
