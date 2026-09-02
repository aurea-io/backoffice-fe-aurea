import React, { useState, useEffect } from 'react';
import { Store, User, Sparkles, Check, Globe, Phone, MapPin, Instagram } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { tenantService } from '../../services/tenant.service';
import { authService } from '../../services/auth.service';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import type { TenantSettings } from '../../types';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { currentTenant, activeTenantId, setCurrentTenant } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'BUSINESS' | 'PROFILE'>('BUSINESS');

  // Business settings state
  const [primaryColor, setPrimaryColor] = useState('#7c3aed');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [instagram, setInstagram] = useState('');
  const [schedule, setSchedule] = useState('');

  // User profile state
  const [userName, setUserName] = useState(user?.name || '');
  const [userAvatar, setUserAvatar] = useState(user?.avatarUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) {
      const s = (currentTenant.settings || {}) as TenantSettings;
      setPrimaryColor(s.branding?.primaryColor || '#7c3aed');
      setTagline(s.branding?.tagline || '');
      setPhone(s.contact?.phone || '');
      setWhatsapp(s.contact?.whatsapp || '');
      setAddress(s.contact?.address || '');
      setCity(s.contact?.city || '');
      setInstagram(s.contact?.instagram || '');
      setSchedule(s.schedule?.hours || '');
    }
  }, [currentTenant]);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updatedSettings: TenantSettings = {
        branding: {
          primaryColor,
          tagline,
        },
        contact: {
          phone,
          whatsapp,
          address,
          city,
          instagram,
        },
        schedule: {
          hours: schedule,
        },
      };

      const updated = await tenantService.updateSettings(updatedSettings);
      setCurrentTenant(updated);
      setSuccessMessage('¡Configuración del negocio guardada exitosamente!');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al guardar los ajustes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const updated = await authService.updateProfile({
        name: userName,
        avatarUrl: userAvatar,
      });
      updateUser(updated);
      setSuccessMessage('¡Perfil actualizado con éxito!');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error al actualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
          Personalización & Identidad
        </span>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Ajustes Generales
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Configura los datos comerciales, imagen de marca y tu perfil personal.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('BUSINESS');
            setSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'BUSINESS'
              ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 shadow-2xs border border-violet-200/80 dark:border-violet-800/40'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Store size={16} />
          <span>Datos del Negocio ({currentTenant?.name || 'Comercio'})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('PROFILE');
            setSuccessMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'PROFILE'
              ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 shadow-2xs border border-violet-200/80 dark:border-violet-800/40'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <User size={16} />
          <span>Mi Perfil</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Business Form */}
      {activeTab === 'BUSINESS' && (
        <form onSubmit={handleSaveBusiness} className="space-y-6">
          <Card variant="glass" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Identidad & Branding</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Alinea la experiencia visual con la estética de tu marca.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Lema o Subtítulo del Negocio"
                  placeholder="Ej: Experiencias gastronómicas de autor"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Color Primario de Acento
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                      {primaryColor}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Contacto & Ubicación</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Información visible en la cabecera y pie de tu frontend público.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Teléfono / Celular"
                  placeholder="+54 9 11 1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  leftIcon={<Phone size={16} />}
                />

                <Input
                  label="WhatsApp para Pedidos"
                  placeholder="+5491112345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  leftIcon={<Globe size={16} />}
                />

                <Input
                  label="Dirección Física"
                  placeholder="Av. Santa Fe 1234"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  leftIcon={<MapPin size={16} />}
                />

                <Input
                  label="Ciudad / Localidad"
                  placeholder="Buenos Aires, AR"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Input
                  label="Usuario de Instagram"
                  placeholder="@tunegocio"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  leftIcon={<Instagram size={16} />}
                />

                <Input
                  label="Horarios de Atención"
                  placeholder="Mar a Dom de 09:00 a 20:00"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Guardar Datos Comerciales
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Profile Form */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card variant="glass" padding="md">
            <CardHeader>
              <div>
                <CardTitle>Datos Personales</CardTitle>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Actualiza tu nombre visible en la plataforma y avatar.
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : userName ? (
                    userName.slice(0, 2).toUpperCase()
                  ) : (
                    'U'
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {userName || 'Tu Nombre'}
                  </h4>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
              </div>

              <Input
                label="Nombre Completo"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />

              <Input
                label="URL de Foto de Perfil (Avatar)"
                placeholder="https://..."
                value={userAvatar}
                onChange={(e) => setUserAvatar(e.target.value)}
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                Actualizar Mi Perfil
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
