import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, UtensilsCrossed, Sparkles } from 'lucide-react';
import { useTenantStore } from '../../../../store/tenantStore';
import { catalogService } from '../../../../services/catalog.service';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { EmptyState } from '../../../../components/common/EmptyState';
import { LoadingSpinner } from '../../../../components/common/LoadingSpinner';
import { CatalogCard } from './components/CatalogCard';
import { CatalogItemModal } from './components/CatalogItemModal';
import type { CatalogItem, CreateCatalogItemInput, UpdateCatalogItemInput } from '../../../../types';

export default function CatalogPage() {
  const { currentTenant, activeTenantId } = useTenantStore();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SERVICES' | 'PRODUCTS'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CatalogItem | null>(null);

  const fetchItems = async () => {
    if (!activeTenantId) return;
    setIsLoading(true);
    try {
      const res = await catalogService.getAll();
      setItems(res);
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
    if (window.confirm('¿Seguro que deseas eliminar este item del catálogo?')) {
      try {
        await catalogService.remove(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } catch (err) {
        console.error('Error deleting item:', err);
      }
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

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
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

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={16} />}
        >
          {isBeautyVertical ? 'Nuevo Servicio' : 'Nuevo Producto'}
        </Button>
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
    </div>
  );
}
