# Catálogo — Estado del proyecto

> Este archivo es la referencia viva del avance del proyecto. Actualízalo cada vez que se
> agregue, cambie o elimine una feature relevante. No documentes aquí detalles de
> implementación que se puedan leer del código (eso vive en el código); documenta qué existe,
> qué falta y por qué se tomaron ciertas decisiones.

## Stack

- **Next.js 16** (App Router) + React 19
- **Sequelize** + PostgreSQL
- **NextAuth** (Credentials provider: email/password + bcrypt), sesiones JWT
- **shadcn/ui** + Tailwind CSS + `next-themes` (dark mode)
- Subida de archivos a `/public/uploads` (logos, imágenes de producto, imágenes de variante)

## Roles

- **admin** — gestiona vendors y categorías globales desde `/admin`
- **vendor** (user con `vendorId`) — gestiona su tienda desde `/dashboard`
- **cliente/guest** — navega la tienda pública `/[slug]`, compra sin cuenta (carrito por `guestKey`)

## Features completadas

### Auth y cuentas
- Registro de vendor (crea `User` + `Vendor` juntos) y login vía NextAuth Credentials.
- Roles `admin` / `vendor` en el modelo `User`.

### Admin (`/admin`)
- CRUD de vendors (crear, editar, ver detalle).
- CRUD de categorías globales, asociables a vendors.
- Activar/desactivar vendor (`isActive`).
- Categorías por tienda (`/admin/vendors/[vendorId]/categories`): crear, reordenar, **editar**
  y **eliminar** — misma UI (`SortableCategoryList`) y mismas capacidades que el dashboard de
  vendor, antes solo tenía reorder.

### Dashboard de vendedor (`/dashboard`)
- CRUD de productos: crear, editar, **duplicar**, **habilitar/deshabilitar**.
- Variantes de producto (nombre, precio opcional, foto opcional) — ver `Pendientes`.
- Precio mayoreo a nivel de producto (precio unitario, cantidad mínima, descripción).
- CRUD de categorías propias del vendor, con reorder (drag & drop, `position`), **editar**
  (nombre/slug) y eliminar.
- Etiqueta de producto (`badge`: nuevo / oferta / premium / más vendido), seleccionable al
  crear o editar producto, se refleja en la tienda pública.
- Reorder de productos, incluido reorder por categoría (`SortableProductsByCategory`).
- Configuración de tienda: logo, slogan, tags, colores de tema, región, teléfono de WhatsApp.
- Toggle online/offline de la tienda (`isOnline` + `OnlineToggle`, `OnlineIndicator` en público).

### Tienda pública (`/[slug]`)
- Header de tienda tipo "perfil" (referencia: apps de red social) — logo, nombre, slogan,
  indicador online, botón de **ubicación** (popover con ciudad/estado desde config, solo si
  el vendor los llenó), botón "Mensajes" (WhatsApp) y like con contador.
- Tabs `Vitrina` (ícono 🛍️, sin texto — grid de productos actual) / `Presentaciones`
  (placeholder "Próximamente", sin funcionalidad aún).
- Catálogo (`CategoryFilterBar`): buscador con **autocompletado** (dropdown de hasta 6
  sugerencias con foto/nombre/precio, debounce 300ms, endpoint
  `/api/vendors/[vendorId]/products/search`), botón "Categorías" que despliega/colapsa los
  chips de categoría, y orden "Relevancia" (más reciente / precio asc / precio desc).
- Cards de producto (`PublicProductCard`): badge de etiqueta (nuevo/oferta/premium/más
  vendido) sobre la imagen, botón "+ Agregar" junto al precio (mismo lugar en todas las
  cards del grid — la columna de texto usa `flex-1` para que precio/botón queden siempre
  alineados aunque un producto tenga descripción y otro no), indicador de precio por
  mayoreo si aplica.
- Detalle de producto (`ProductDetailSheet`) con lightbox de imágenes, selección de variante,
  precio mayoreo con desglose de lote.
- Carrito de invitado (`CartProvider`, `CartDrawer`) persistente por `guestKey`.
- Checkout por WhatsApp: genera link `wa.me` con el pedido formateado.
- Sistema de likes por vendor (`VendorLike`, fingerprint + IP, sin cuenta requerida).
- Dark mode con `ThemeSwitcher`.

### Infra / calidad
- Migraciones Sequelize incrementales (`db/migrations/`), una por cambio de esquema.
- `revalidatePath` aplicado tras mutaciones (categorías, productos, reorder) para evitar
  caché stale en la tienda pública.

## Pendientes / decisiones abiertas

- **Mayoreo por variante**: no implementado, pospuesto hasta que un cliente lo pida. Hoy el
  mayoreo aplica al precio base del producto sin importar la variante seleccionada; el vendedor
  puede aclarar condiciones por variante en el campo de descripción. Ver detalle técnico en
  el modelo `ProductVariant` y `ProductDetailSheet.js` si se retoma.
- (agregar aquí lo que vaya surgiendo)

## Changelog reciente

- **2026-08-20** — ajustes de feedback en el catálogo público: tab Vitrina solo con ícono
  (sin texto), botón de agregar vuelve a "+ Agregar" junto al precio (no flotante sobre la
  imagen, así lo prefieren los clientes), y alineación consistente del botón entre cards
  con/sin descripción.
- **2026-08-19** — rediseño del catálogo público (header tipo perfil, tabs Vitrina/
  Presentaciones, buscador con autocompletado, orden, badges de producto, agregar rápido);
  paridad de edición/eliminación de categorías entre admin y vendor.
- **2026-08 (`bb5d743`)** — eliminación de categorías.
- **2026-08 (`8081768`)** — variantes de producto, precio mayoreo, fix de lightbox y layout desktop.
- **2026-08 (`614da16`)** — estado de vendedor (online/offline), habilitar/deshabilitar y
  duplicar producto en el dashboard.
- **2026-08 (`3bc2c82`)** — detalle de producto (`ProductDetailSheet`).
- **2026-08 (`dfc0255`)** — sistema de likes.
- Antes de esto: MVP de backend (auth, catálogo, carrito de invitado, checkout por WhatsApp,
  upload de imágenes) y refactor de frontend a shadcn/ui + Tailwind + dark mode.
