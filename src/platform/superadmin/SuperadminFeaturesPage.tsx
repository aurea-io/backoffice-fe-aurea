import { Layers, ShieldAlert, Sparkles } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import type { FeatureKey } from '../../types';

interface FeatureDef {
  key: FeatureKey;
  name: string;
  description: string;
  badge: string;
  details: string;
  verticals: string[];
  category: string;
  requires?: string[];
}

const PLATFORM_FEATURES: FeatureDef[] = [
  {
    key: 'catalog',
    name: 'Catálogo de Productos & Servicios',
    description: 'Permite a los comercios crear y gestionar items con precios, categorías e imágenes.',
    badge: 'Base',
    details: 'CRUD completo de items. Soporte para productos físicos y servicios con duración. Filtrado por categoría.',
    verticals: ['Gastronomía', 'Belleza', 'Salud', 'Comercio'],
    category: 'Commerce',
  },
  {
    key: 'bookings',
    name: 'Turnos & Reservas de Agenda',
    description: 'Sistema de reserva online con selección de profesional, fecha y franja horaria.',
    badge: 'Servicios',
    details: 'Integración con agenda. Notificaciones por email/WhatsApp. Confirmación y cancelación automática.',
    verticals: ['Belleza', 'Salud', 'Servicios'],
    category: 'Services',
    requires: ['catalog'],
  },
  {
    key: 'tables',
    name: 'Gestión de Salón & Mesas',
    description: 'Sesión compartida en mesa con asignación de pedidos y vista de ticket.',
    badge: 'Gastronomía',
    details: 'Layout de salón visual. QR por mesa. Pedidos asociados a cada mesa. Cierre de cuenta parcial o total.',
    verticals: ['Gastronomía', 'Bares'],
    category: 'Operations',
    requires: ['catalog'],
  },
  {
    key: 'delivery',
    name: 'Delivery & Retiro en Local',
    description: 'Carrito de compras con cálculo de envío y confirmación por WhatsApp.',
    badge: 'Comercio',
    details: 'Flujo de checkout. Zonas de envío. Métodos de pago configurables. Confirmación por WhatsApp.',
    verticals: ['Gastronomía', 'Comercio', 'Pastelería'],
    category: 'Commerce',
    requires: ['catalog'],
  },
  {
    key: 'reviews',
    name: 'Reseñas & Puntuaciones',
    description: 'Feedback y testimonios de clientes directamente en el frontend.',
    badge: 'Fidelización',
    details: 'Rating de 1-5 estrellas. Comentarios moderados. Integración en la landing pública del comercio.',
    verticals: ['Todos'],
    category: 'Engagement',
  },
  {
    key: 'social_hub',
    name: 'Social Hub & Enlaces NFC',
    description: 'Landing tipo link-in-bio para redes sociales y enlaces a cartas digitales.',
    badge: 'Marketing',
    details: 'Landing personalizada con branding. Links configurables. QR y NFC para acceso rápido.',
    verticals: ['Todos'],
    category: 'Marketing',
  },
];

export function SuperadminFeaturesPage() {
  const featureGroups = PLATFORM_FEATURES.reduce<Record<string, FeatureDef[]>>((groups, feature) => {
    (groups[feature.category] ||= []).push(feature);
    return groups;
  }, {});
  const featureNames = new Map(PLATFORM_FEATURES.map((feature) => [feature.key, feature.name]));

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
          <Layers size={14} />
          Catálogo de Módulos
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Módulos Disponibles
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Estos son los módulos que podés activar o desactivar para cada tenant desde su gestión.
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/30 flex items-start gap-3">
        <Sparkles size={18} className="text-violet-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">
            Configuración por Tenant
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
            Para activar o desactivar módulos de un comercio específico, andá a{' '}
            <strong>Tenants → Gestionar → pestaña Módulos</strong>.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="space-y-6">
        {Object.entries(featureGroups).map(([category, features]) => (
          <section key={category} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <Card
                  key={feature.key}
                  variant="glass"
                  padding="md"
                  className="space-y-3 hover:border-violet-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {feature.name}
                    </h3>
                    <Badge variant="violet" size="sm">
                      {feature.badge}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    <span>{feature.category}</span>
                    {feature.requires && (
                      <span>
                        · Requiere: {feature.requires.map((key) => featureNames.get(key) ?? key).join(', ')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {feature.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
                    <p className="text-[11px] text-zinc-400 mb-1.5 font-semibold uppercase tracking-wider">
                      Detalles
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {feature.details}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {feature.verticals.map((v) => (
                      <span
                        key={v}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
