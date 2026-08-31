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
import type { Tenant } from '../../../types';
import type { CreateTenantPayload, UpdateTenantPayload } from '../../../services/superadmin.service';

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTenantPayload | UpdateTenantPayload) => Promise<void>;
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
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenantToEdit) {
      setName(tenantToEdit.name);
      setSlug(tenantToEdit.slug);
      setVertical(tenantToEdit.vertical);
      setIsActive(tenantToEdit.isActive);
      setOwnerEmail('');
    } else {
      setName('');
      setSlug('');
      setVertical('gastronomy');
      setIsActive(true);
      setOwnerEmail('');
    }
    setError(null);
  }, [tenantToEdit, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!tenantToEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('El nombre y el slug del comercio son requeridos.');
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
      } else {
        await onSave({
          name: name.trim(),
          slug: slug.trim(),
          vertical,
          ownerEmail: ownerEmail.trim() || undefined,
          initialFeatures: ['catalog'],
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el tenant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tenantToEdit ? 'Editar Tenant' : 'Crear Nuevo Comercio / Tenant'}
          </DialogTitle>
          <DialogDescription>
            Asegura el aislamiento multitenant para el nuevo espacio comercial.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <Input
            label="Nombre Comercial"
            placeholder="Ej: De Santas Spa, La Esquina Bistro..."
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Slug de URL"
            placeholder="desantas"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            helperText={`Frontend accesible en: /preview/${slug || 'slug'}`}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Vertical / Rubro de Negocio
            </label>
            <select
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className="w-full bg-white dark:bg-[#12131e] text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-violet-500"
            >
              <option value="gastronomy">Gastronomía & Restaurantes</option>
              <option value="beauty">Belleza, Estética & Turnos</option>
              <option value="stock">Pastelería & Stock Minorista</option>
              <option value="health">Salud & Profesionales</option>
              <option value="realestate">Inmobiliaria & Propiedades</option>
              <option value="general">Comercio General</option>
            </select>
          </div>

          {!tenantToEdit && (
            <Input
              label="Email del Dueño / Owner Inicial (opcional)"
              type="email"
              placeholder="cliente@gmail.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              helperText="Si el usuario existe, se le asignará el rol OWNER automáticamente."
            />
          )}

          {tenantToEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isTenantActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-violet-600 rounded-md border-zinc-300 focus:ring-violet-500"
              />
              <label htmlFor="isTenantActive" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                Tenant activo en la plataforma
              </label>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {tenantToEdit ? 'Guardar Cambios' : 'Crear Espacio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
