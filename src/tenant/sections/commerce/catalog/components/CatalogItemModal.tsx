import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../../components/ui/Dialog';
import { Input } from '../../../../../components/ui/Input';
import { Button } from '../../../../../components/ui/Button';
import type { CatalogItem, CreateCatalogItemInput, UpdateCatalogItemInput } from '../../../../../types';

interface CatalogItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCatalogItemInput | UpdateCatalogItemInput) => Promise<void>;
  itemToEdit?: CatalogItem | null;
}

export function CatalogItemModal({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}: CatalogItemModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stockInitial, setStockInitial] = useState('');
  const [category, setCategory] = useState('');
  const [isService, setIsService] = useState(false);
  const [durationMin, setDurationMin] = useState('30');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimizeImage = (file: File) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => { const image = new Image(); image.onload = () => { const scale = Math.min(1, 1600 / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/webp', 0.82)); }; image.onerror = reject; image.src = String(reader.result); }; reader.onerror = reject; reader.readAsDataURL(file); });

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setDescription(itemToEdit.description || '');
      setPrice((itemToEdit.priceCents / 100).toString());
      setSku(itemToEdit.sku || '');
      setStockInitial(itemToEdit.stockInitial?.toString() || '');
      setCategory(itemToEdit.category || '');
      setIsService(itemToEdit.isService);
      setDurationMin(itemToEdit.durationMin ? itemToEdit.durationMin.toString() : '30');
      setImageUrl(itemToEdit.imageUrl || '');
      setIsActive(itemToEdit.isActive);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setSku('');
      setStockInitial('');
      setCategory('');
      setIsService(false);
      setDurationMin('30');
      setImageUrl('');
      setIsActive(true);
    }
    setError(null);
  }, [itemToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es requerido.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Por favor ingresa un precio válido.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: CreateCatalogItemInput = {
        title: title.trim(),
        description: description.trim() || undefined,
        priceCents: Math.round(priceNum * 100),
        sku: sku.trim() || undefined,
        stockInitial: stockInitial ? Number(stockInitial) : undefined,
        category: category.trim() || undefined,
        isService,
        durationMin: isService ? parseInt(durationMin, 10) || 30 : undefined,
        imageUrl: imageUrl.trim() || undefined,
        isActive,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el item en el catálogo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {itemToEdit ? 'Editar Producto / Servicio' : 'Nuevo Producto o Servicio'}
          </DialogTitle>
          <DialogDescription>
            Configura los datos que verán tus clientes en el frontend público.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          {/* Service vs Product Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => setIsService(false)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                !isService
                  ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Producto Físico / Plato
            </button>
            <button
              type="button"
              onClick={() => setIsService(true)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                isService
                  ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Servicio / Turno
            </button>
          </div>

          <Input
            label="Título"
            placeholder="Ej: Corte y Peinado, Hamburguesa Especial..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5"><label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Cargar imagen optimizada (opcional)</label><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { setImageUrl(await optimizeImage(file)); } catch { setError('No se pudo procesar la imagen.'); } }} className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-violet-700" /><p className="text-[10px] text-zinc-400">Se redimensiona a un máximo de 1600 px y se comprime antes de guardar.</p></div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Descripción
            </label>
            <textarea
              rows={2}
              className="w-full bg-white dark:bg-[#12131e] text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-zinc-400"
              placeholder="Detalles sobre ingredientes, pasos del servicio o beneficios..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Precio ($)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />

            <Input
              label="Categoría"
              placeholder="Ej: Salón, Bebidas..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU (opcional)" placeholder="Ej: PROD-001" value={sku} onChange={(e) => setSku(e.target.value)} />
            {!isService && <Input label="Stock inicial" type="number" min="0" step="0.01" placeholder="0" value={stockInitial} onChange={(e) => setStockInitial(e.target.value)} />}
          </div>

          {isService && (
            <Input
              label="Duración (minutos)"
              type="number"
              placeholder="30"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
            />
          )}

          <Input
            label="URL de Imagen (opcional)"
            type={imageUrl.startsWith('data:') ? 'text' : 'url'}
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-violet-600 rounded-md border-zinc-300 dark:border-zinc-700 focus:ring-violet-500"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              Visible y disponible para venta / reservas
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {itemToEdit ? 'Guardar Cambios' : 'Crear Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
