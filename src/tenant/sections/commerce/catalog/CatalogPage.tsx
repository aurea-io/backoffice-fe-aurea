import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, Filter, UtensilsCrossed, Sparkles } from 'lucide-react';
import { useTenantStore } from '../../../../store/tenantStore';
import { catalogService } from '../../../../services/catalog.service';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { EmptyState } from '../../../../components/common/EmptyState';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/Dialog';
import { CatalogCard } from './components/CatalogCard';
import { CatalogItemModal } from './components/CatalogItemModal';
import type { CatalogCategory, CatalogItem, CatalogModifierGroup, CreateCatalogItemInput, UpdateCatalogItemInput } from '../../../../types';

export default function CatalogPage() {
  const { currentTenant, activeTenantId } = useTenantStore();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categoriesData, setCategoriesData] = useState<CatalogCategory[]>([]);
  const [modifierGroups, setModifierGroups] = useState<CatalogModifierGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SERVICES' | 'PRODUCTS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [catalogDialog, setCatalogDialog] = useState<'category' | 'modifier' | 'delete' | null>(null);
  const [dialogValue, setDialogValue] = useState('');
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CatalogCategory | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogSubmitting, setIsDialogSubmitting] = useState(false);

  const fetchItems = async () => {
    if (!activeTenantId) return;
    setIsLoading(true);
    try {
      const [res, categories, modifiers] = await Promise.all([catalogService.getAll(), catalogService.getCategories(), catalogService.getModifierGroups()]);
      setItems(res);
      setCategoriesData(categories);
      setModifierGroups(modifiers);
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTenantId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type Filter
      if (filterType === 'SERVICES' && !item.isService) return false;
      if (filterType === 'PRODUCTS' && item.isService) return false;

      // Category Filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

      // Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchCat = item.category?.toLowerCase().includes(query);
        return matchTitle || matchDesc || matchCat;
      }

      return true;
    });
  }, [items, filterType, selectedCategory, search]);

  const handleSaveItem = async (data: CreateCatalogItemInput | UpdateCatalogItemInput) => {
    if (itemToEdit) {
      await catalogService.update(itemToEdit.id, data);
    } else {
      await catalogService.create(data as CreateCatalogItemInput);
    }
    await fetchItems();
  };

  const handleDeleteItem = async (id: string) => {
    const item = items.find((candidate) => candidate.id === id);
    if (item) {
      setItemToDelete(item);
      setCatalogDialog('delete');
    }
  };

  const handleToggleStatus = async (item: CatalogItem) => {
    try {
      const updated = await catalogService.update(item.id, { isActive: !item.isActive });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const isBeautyVertical = currentTenant?.vertical === 'beauty';
  const importCsv = async (file?: File) => {
    if (!file) return;
    setIsImporting(true);
    setActionMessage(null);
    setActionError(null);
    setImportErrors([]);
    try {
      const result = await catalogService.importCsv(await file.text());
      await fetchItems();
      setImportErrors(result.errors);
      setActionMessage(`Importación completa: ${result.imported} importados, ${result.validRows} filas válidas y ${result.errors.length} errores.`);
    } catch (err: any) {
      setActionMessage(null);
      setImportErrors(err.response?.data?.errors || []);
      setActionError(err.response?.data?.message || 'No se pudo importar el CSV. Revisá el formato e intentá nuevamente.');
    } finally {
      setIsImporting(false);
      if (importInput.current) importInput.current.value = '';
    }
  };

  const closeCatalogDialog = () => {
    setCatalogDialog(null);
    setDialogValue('');
    setItemToDelete(null);
    setCategoryToDelete(null);
  };

  const submitCatalogDialog = async () => {
    setIsDialogSubmitting(true);
    try {
      if (catalogDialog === 'category') {
        if (!dialogValue.trim()) return;
        await catalogService.createCategory({ name: dialogValue.trim() });
        await fetchItems();
        setActionMessage('Categoría creada correctamente.');
      } else if (catalogDialog === 'modifier') {
        if (!dialogValue.trim()) return;
        await catalogService.createModifierGroup({ name: dialogValue.trim(), options: [] });
        await fetchItems();
        setActionMessage('Grupo de modificadores creado correctamente.');
      } else if (catalogDialog === 'delete' && itemToDelete) {
        await catalogService.remove(itemToDelete.id);
        setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setActionMessage('Ítem eliminado correctamente.');
      } else if (catalogDialog === 'delete' && categoryToDelete) {
        await catalogService.removeCategory(categoryToDelete.id);
        await fetchItems();
        setActionMessage('Categoría eliminada correctamente.');
      }
      setActionError(null);
      closeCatalogDialog();
    } catch (err: any) {
      setActionMessage(null);
      setActionError(err.response?.data?.message || 'No se pudo completar la acción.');
    } finally {
      setIsDialogSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {actionMessage && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">{actionMessage}</div>}
      {actionError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-200">{actionError}</div>}
      {importErrors.length > 0 && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-100"><p className="font-semibold">Detalle de errores del CSV</p><ul className="mt-2 list-disc space-y-1 pl-5">{importErrors.map((error, index) => <li key={`${error.row}-${index}`}>Fila {error.row}: {error.message}</li>)}</ul></div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            {isBeautyVertical ? 'Servicios & Tratamientos' : 'Menú & Catálogo Comercial'}
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {isBeautyVertical ? 'Gestión de Servicios' : 'Catálogo de Productos'}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Administra precios, descripciones y disponibilidad visible en tu tienda o turnos online.
          </p>
        </div>

        <div className="flex gap-2"><input ref={importInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => importCsv(event.target.files?.[0])} /><Button variant="outline" size="md" disabled={isImporting} onClick={() => importInput.current?.click()}>{isImporting ? 'Importando…' : 'Importar CSV'}</Button><Button
          variant="primary"
          size="md"
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={16} />}
        >
          {isBeautyVertical ? 'Nuevo Servicio' : 'Nuevo Producto'}
        </Button></div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#12131e] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        {/* Search */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Type Toggle + Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterType('SERVICES')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'SERVICES'
                  ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Servicios
            </button>
            <button
              type="button"
              onClick={() => setFilterType('PRODUCTS')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                filterType === 'PRODUCTS'
                  ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-300 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Productos
            </button>
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 text-xs rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-700/60 focus:outline-none focus:border-violet-500"
            >
              <option value="ALL">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Grid of Items */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner size="lg" label="Cargando catálogo comercial..." />
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={search ? 'No se encontraron resultados' : 'El catálogo está vacío'}
          description={
            search
              ? 'Intenta con otro término de búsqueda o limpia los filtros activos.'
              : 'Comienza agregando tu primer producto o servicio para que tus clientes puedan verlo y comprarlo.'
          }
          actionLabel="Agregar Primer Item"
          onAction={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              onEdit={(it) => {
                setItemToEdit(it);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteItem}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CatalogItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-[#12131e]">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-zinc-900 dark:text-white">Categorías</h2><p className="text-xs text-zinc-500">Organizá productos y servicios en niveles.</p></div><Button size="sm" variant="outline" onClick={() => { setDialogValue(''); setCatalogDialog('category'); }}> <Plus size={14} />Agregar</Button></div>
          <div className="space-y-2">{categoriesData.map((category) => <div key={category.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900"><span>{category.parentId ? '↳ ' : ''}{category.name}</span><button className="text-xs text-rose-600" onClick={() => { setCategoryToDelete(category); setCatalogDialog('delete'); }}>Eliminar</button></div>)}{categoriesData.length === 0 && <p className="text-sm text-zinc-500">Todavía no hay categorías.</p>}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800/80 dark:bg-[#12131e]">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-zinc-900 dark:text-white">Modificadores</h2><p className="text-xs text-zinc-500">Grupos de opciones para productos y servicios.</p></div><Button size="sm" variant="outline" onClick={() => { setDialogValue(''); setCatalogDialog('modifier'); }}><Plus size={14} />Agregar</Button></div>
          <div className="space-y-2">{modifierGroups.map((group) => <div key={group.id} className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-zinc-900"><div className="flex justify-between text-sm"><span>{group.name}</span><span className="text-xs text-zinc-500">{group.minSelections}–{group.maxSelections} opciones</span></div><p className="mt-1 text-xs text-zinc-500">{group.options.map((option) => option.name).join(' · ') || 'Sin opciones cargadas'}</p></div>)}{modifierGroups.length === 0 && <p className="text-sm text-zinc-500">Todavía no hay grupos de modificadores.</p>}</div>
        </div>
      </section>

      <Dialog open={catalogDialog !== null} onOpenChange={(open) => !open && closeCatalogDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{catalogDialog === 'category' ? 'Nueva categoría' : catalogDialog === 'modifier' ? 'Nuevo grupo de modificadores' : itemToDelete ? 'Eliminar ítem' : 'Eliminar categoría'}</DialogTitle>
            <DialogDescription>
              {catalogDialog === 'delete' ? `¿Querés eliminar “${itemToDelete?.title || categoryToDelete?.name}”? Esta acción no se puede deshacer.` : 'Completá el nombre y confirmá para guardar.'}
            </DialogDescription>
          </DialogHeader>
          {catalogDialog !== 'delete' && <Input autoFocus label="Nombre" value={dialogValue} onChange={(event) => setDialogValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void submitCatalogDialog()} placeholder={catalogDialog === 'category' ? 'Ej: Peluquería' : 'Ej: Tamaño'} />}
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" disabled={isDialogSubmitting} onClick={closeCatalogDialog}>Cancelar</Button>
            <Button type="button" variant={catalogDialog === 'delete' ? 'danger' : 'primary'} size="sm" disabled={isDialogSubmitting || (catalogDialog !== 'delete' && !dialogValue.trim())} onClick={() => void submitCatalogDialog()}>{isDialogSubmitting ? 'Guardando…' : catalogDialog === 'delete' ? 'Eliminar' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
