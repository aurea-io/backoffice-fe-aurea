import { Edit3, Trash2, Clock, Check, EyeOff } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Badge } from '../../../../../components/ui/Badge';
import { Button } from '../../../../../components/ui/Button';
import type { CatalogItem } from '../../../../../types';

interface CatalogCardProps {
  item: CatalogItem;
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (item: CatalogItem) => void;
}

export function CatalogCard({
  item,
  onEdit,
  onDelete,
  onToggleStatus,
}: CatalogCardProps) {
  const priceFormatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(item.priceCents / 100);

  return (
    <Card
      variant="glass"
      padding="none"
      className="overflow-hidden flex flex-col justify-between group hover:border-violet-500/40 transition-all duration-200"
    >
      <div>
        {/* Cover / Image Header */}
        <div className="h-32 bg-gradient-to-br from-violet-950/20 via-zinc-100 to-zinc-200 dark:from-violet-950/40 dark:via-zinc-900 dark:to-[#12131e] relative flex items-center justify-center overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="font-editorial text-3xl font-bold text-violet-600/30 dark:text-violet-400/30">
              {item.title.slice(0, 2).toUpperCase()}
            </span>
          )}

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <Badge variant={item.isService ? 'emerald' : 'violet'} size="sm">
              {item.isService ? 'Servicio' : 'Producto'}
            </Badge>
            {item.category && (
              <span className="text-[10px] font-semibold bg-black/50 text-white backdrop-blur-xs px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5">
            <Badge variant={item.isActive ? 'emerald' : 'zinc'} size="sm" dot={item.isActive}>
              {item.isActive ? 'Activo' : 'Pausado'}
            </Badge>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-editorial text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
              {item.title}
            </h4>
            <span className="font-bold text-sm text-violet-700 dark:text-violet-300 shrink-0">
              {priceFormatted}
            </span>
          </div>

          {item.description ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[32px]">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-600 italic min-h-[32px]">
              Sin descripción detallada.
            </p>
          )}

          {item.isService && item.durationMin && (
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 pt-1">
              <Clock size={12} className="text-violet-500" />
              <span>Duración estimada: {item.durationMin} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleStatus(item)}
          className="text-[11px] h-7 px-2"
        >
          {item.isActive ? (
            <>
              <EyeOff size={13} className="mr-1 text-zinc-400" />
              Pausar
            </>
          ) : (
            <>
              <Check size={13} className="mr-1 text-emerald-500" />
              Activar
            </>
          )}
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(item)}
            className="h-7 w-7 rounded-lg"
            title="Editar Item"
          >
            <Edit3 size={13} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="h-7 w-7 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Eliminar Item"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
