# Aurea Pages · Backoffice Frontend (PWA)

Frontend moderno, multitenant y modular para la plataforma **Aurea Pages**, desarrollado como PWA instalable con soporte completo para modo claro / oscuro y acentos de diseño violeta editorial.

## 🚀 Stack Tecnológico

- **Framework**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS v4 con paleta violeta (`#7c3aed`), glassmorphism y fuentes Google (*DM Sans* y *Playfair Display*)
- **PWA**: `vite-plugin-pwa` con Service Worker, Web App Manifest instalable y caché optimizado
- **Estado Global**: Zustand (`authStore`, `tenantStore`, `themeStore`)
- **Cliente HTTP**: Axios con interceptor dinámico de `x-tenant-id`, JWT Bearer y cola de silent refresh en 401
- **Componentes**: Radix UI + Lucide Icons + TanStack Query

## 📁 Estructura del Proyecto

```
src/
├── api/             # Instancia de Axios e interceptores automáticos
├── components/
│   ├── auth/        # Guards (ProtectedRoute, SuperadminRoute)
│   ├── common/      # TenantSwitcher, EmptyState, LoadingSpinner
│   ├── layout/      # Sidebar, Topbar, MobileNav, AppLayout
│   └── ui/          # Button, Card, Dialog, Input, Badge, ThemeToggle
├── features/
│   ├── auth/        # Login, Registro, Magic Links, Reset Password
│   ├── catalog/     # CRUD de productos y servicios con categorías y fotos
│   ├── dashboard/   # Resumen operativo, métricas y enlace público
│   ├── members/     # Gestión del equipo y roles (Owner, Manager, Staff, Cashier)
│   ├── preview/     # Vista interactiva del frontend para clientes
│   ├── settings/    # Ajustes del comercio (branding, horarios, redes) y perfil
│   └── superadmin/  # Administración global de tenants y conmutación de módulos FBAC
├── services/        # Clientes de API tipados (auth, tenant, catalog, superadmin)
├── store/           # Stores Zustand con persistencia en localStorage
├── types/           # Definiciones TypeScript de modelos y respuestas API
├── App.tsx          # Definición de rutas y chequeo de sesión
└── main.tsx         # Bootstrap React 19
```

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

## 📖 Documentación de Arquitectura y Negocio

- [Gestión de Usuarios y Tenants (Frontend)](./docs/GESTION_USUARIOS_Y_TENANTS.md): Especificación detallada de flujos UX, Tenant Switcher, guards FBAC/RBAC y paneles de administración de colaboradores y comercios.

