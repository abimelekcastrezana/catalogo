# PLAN DE REFACTOR FRONTEND - shadcn/ui + Tailwind

## Objetivo
Refactor profesional del frontend con shadcn/ui y Tailwind CSS, manteniendo funcionalidad correcta, dark mode y reutilización de componentes entre admin y vendor.

---

## 📋 Fase 1: Setup Infrastructure (sin romper nada)

### 1.1 Instalar shadcn/ui + Tailwind CSS
- Agregar Tailwind CSS, PostCSS
- Instalar shadcn/ui CLI
- Configurar `tailwind.config.ts` con dark mode
- Mantener CSS custom vars por compatibilidad temporal

### 1.2 Estructura de carpetas mejorada
```
/app
├── /components
│   ├── /ui           ← shadcn/ui + custom
│   ├── /shared       ← componentes comunes (admin + vendor)
│   ├── /admin        ← solo admin
│   ├── /vendor       ← solo vendor
│   └── /public       ← solo tienda pública
├── /hooks
├── /lib
│   ├── auth.js
│   ├── api.js
│   └── utils.js
├── /context
└── /styles           ← Tailwind + custom theme
```

### 1.3 Sistema de temas profesional
- Migrar de `data-theme` a Tailwind dark mode class
- Mantener localStorage para persistencia
- Soportar system preference fallback
- Integrar con `next-themes`

---

## 🎨 Fase 2: Componentes UI Base (reutilizables)

Crear en `/components/ui/`:

### Botones & Acciones
- `Button` (variants: primary, secondary, ghost, danger, outline)
- `IconButton`
- `ButtonGroup`

### Inputs & Forms
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `Radio`
- `Label`
- `FormField` (con error handling)

### Contenedores
- `Card` (header, body, footer)
- `Container`
- `Section`
- `Grid`

### Modales & Overlays
- `Dialog`
- `Drawer`
- `Popover`
- `Tooltip`

### Feedback
- `Badge`
- `Alert`
- `Toast`
- `ProgressBar`
- `LoadingSpinner`

### Navegación
- `Navbar`
- `Sidebar`
- `Breadcrumb`
- `Tabs`

### Media
- `Avatar`
- `Image` (con fallback)

---

## 🔄 Fase 3: Componentes Compartidos

En `/components/shared/`:

### Layout
- `AppHeader` (responsive, logo, dark mode toggle)
- `AppFooter`
- `PageShell` (title + subtitle + actions)
- `AuthLayout` (centered form layout)
- `DashboardLayout` (sidebar + main)
- `AdminLayout` (sidebar + main)

### Formularios
- `ImageUploader` (con preview)
- `ConfirmDialog`
- `FormActions` (save/cancel buttons)

### Comunes
- `LoadingSpinner`
- `EmptyState`
- `ErrorBoundary`
- `NotFoundPage`

### Reutilización
- `ProductCard` (vendor + admin)
- `CategoryCard` (vendor + admin)
- `VendorCard` (admin)

---

## 🔀 Fase 4: Migrar páginas + rutas

### Por orden de criticidad:

#### 4.1 Auth Pages (baja complejidad)
- `/login` 
- `/register`
- Migrar a componentes UI compartidos
- Mantener validaciones existentes

#### 4.2 Public Vendor Page (crítica)
- `/[slug]` (tienda pública)
- `/[slug]/categories` 
- `/[slug]/products`
- Migraciones incrementales: ProductCard → CategoryCard → Layout

#### 4.3 Vendor Dashboard
- `/dashboard/products`
- `/dashboard/categories`
- `/dashboard/config`
- Usar `DashboardLayout` compartido

#### 4.4 Admin Area
- `/admin/vendors`
- `/admin/categories`
- Usar `AdminLayout` compartido (similar a vendor)
- Reutilizar ProductCard, CategoryCard

---

## 🌙 Fase 5: Dark Mode + Testing

### Dark Mode
- Validar `dark:` classes funcionen en Tailwind
- Testear theme toggle en todas las páginas
- Asegurar contraste accesible (WCAG AA)

### Testing Funcional
- Carrito sigue funcionando
- API calls sin cambios
- Responsive en móvil (360px, 768px, 1200px)
- Login/Register sin problemas
- Dark mode toggle persiste

---

## ✨ Fase 6: Feature Nueva

A definir luego, se agregará con componentes shadcn/ui nuevos.

---

## ✅ Qué SE mantiene intacto

✅ API (backend sin cambios)  
✅ Dark mode (mejorado)  
✅ Carrito y checkout  
✅ Lógica de autenticación  
✅ Responsive design  
✅ Modo claro y oscuro  
✅ Reutilización componentes  

---

## 📦 Dependencias a agregar

```json
{
  "dependencies": {
    "next-themes": "^0.2.1",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18"
  }
}
```

---

## 🎯 Resultado esperado

- **Profesional**: Componentes consistentes, theme system robusto
- **Homogéneo**: Admin y vendor comparten UI base
- **Mantenible**: Código limpio, reutilizable
- **Escalable**: Fácil agregar features nuevas
- **Dark Mode**: Completo y accesible
- **Funcional**: Todo sigue funcionando correctamente
