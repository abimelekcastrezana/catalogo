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

### Planes de suscripción
- Tres planes anuales por vendor (`Vendor.plan`): **Free** (gratis), **Plus** ($399 MXN) y
  **Max** ($799 MXN). Límites centralizados en `app/lib/plans.js`; validación de servidor en
  `lib/plan-limits.js`.
  - **Free**: máx. 10 productos, sin categorías; el producto solo tiene 2 fotos, nombre,
    descripción de hasta 100 caracteres y precio (sin categoría, etiqueta, SKU, variantes ni
    mayoreo).
  - **Plus**: todas las funciones de producto, máx. 40 productos y 5 categorías.
  - **Max**: sin límites. En el futuro tendrá cobro con tarjeta dentro de TiendaTap para los
    clientes del vendor.
- Suscripción anual: cada tienda guarda su vencimiento (`Vendor.planExpiresAt`; Free no vence).
  Al asignar Plus/Max el admin propone hoy + 1 año y puede editar la fecha; el admin y el vendor
  ven "vence el …". Todavía no pasa nada al vencer (ver Pendientes).
- Página pública **`/planes`** con precios, qué incluye cada plan y preguntas frecuentes (los
  números salen de `app/lib/plans.js`). Free lleva a registrarse; Plus/Max abren WhatsApp de
  contacto (`CONTACT_WHATSAPP`). Enlazada desde el header, la home, el registro y el dashboard.
- Slugs reservados (`app/lib/reserved-slugs.js`: `planes`, `admin`, `login`…) para que ninguna
  tienda quede tapada por una página de la app.
- Por ahora el plan solo lo asigna el admin (al crear o editar la tienda). El registro público
  arranca en Free; las tiendas que existían antes de esta feature quedaron en Max.
- **Bajar de plan no borra nada**: bloquea crear productos/categorías arriba del límite y la
  tienda pública solo muestra los primeros N productos activos y las primeras N categorías
  según su orden (el excedente queda oculto; el dashboard lo marca con "No se muestra: excede tu
  plan"). En Free, los datos extra (categorías, etiqueta, variantes, mayoreo) se conservan en la
  BD, se ocultan en la tienda y no se tocan al editar; reaparecen si el vendor vuelve a subir.

### Suscripciones (tarjetas con valores)
- Segunda modalidad de venta, mezclada con los productos en la Vitrina. Es una tarjeta prepago
  (pavos de Fortnite, puntos Amazon/Nintendo): **nombre + imagen + 1 a 3 valores**
  (monto y nombre opcional). No es el plan Free/Plus/Max de la tienda.
- Modelo: `Product.kind = 'card'` y sus valores son `ProductVariant` (precio obligatorio);
  `Product.price` guarda el valor más bajo. Por eso comparten límite de plan, orden, duplicar,
  buscador y carrito con los productos.
- Se crea y edita desde `/dashboard/products` y desde admin (mismos componentes). Disponible en
  todos los planes; en Free cuenta dentro del límite de 10 junto con los productos (se puede
  mezclar). Sin SKU ni mayoreo; categoría y etiqueta solo en Plus/Max.
- La imagen no es obligatoria (igual que en los productos); sin imagen se muestra el ícono de marcador.
- Código: reglas puras en `app/lib/products.js`, lógica en `lib/services/productService.js`,
  consultas ORM en `db/queries/products.js`; las rutas API solo autorizan y llaman al servicio.
- Editar un producto ya no borra las fotos de sus variantes (se actualizan por `id`).
- **Descuento** (Plus/Max, solo productos; las suscripciones no): porcentaje 1–99 por producto
  (`Product.discountPercent`) y casilla "Aplicar también al precio de mayoreo"
  (`discountOnWholesale`, la elige el vendedor). La tarjeta y el detalle muestran el precio de
  lista tachado y el que queda; el carrito calcula (cada renglón guarda precio de lista +
  porcentaje; reglas en `app/lib/pricing.js`), muestra "Ahorras $X" y WhatsApp incluye el
  descuento y el ahorro. En Free se ignora aunque llegue en la petición.
- La tarjeta de producto con variantes o suscripción abre el detalle ("Elegir") en vez de agregar
  el precio base.
- **Mayoreo desde la tarjeta** (Plus/Max, productos con mayoreo y sin variantes): selector
  `Pieza | <unidad> ×N`; la unidad mayorista es editable (`Product.wholesaleUnit`: Caja, Paquete,
  Docena…; vacío = "Caja"); el precio y "Agregar" siguen a la opción elegida. Con variantes, el mayoreo
  se elige en el detalle. En el carrito la caja es un renglón distinto de la pieza (`id` con
  sufijo `_lot` y `lotSize`), así que pueden convivir. Falta contrastar con
  `ejemplo_precio_pieza_mayoreo_caja_.png`.

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

### SEO y visibilidad en buscadores / IA
- Metadatos globales en `app/layout.js` (datos en `app/lib/site.js`): título con marca y servicio,
  plantilla "Página | TiendaTap", Open Graph, `metadataBase` desde `NEXTAUTH_URL`.
- Home: canónica, sección "¿Qué es TiendaTap?" con texto de servicio y datos estructurados
  `Organization` + `WebSite` (búsqueda). El logo del header ya no es `h1`.
- `/planes`: `SoftwareApplication` con los precios de cada plan + `FAQPage`.
- Tiendas: título "Nombre | TiendaTap", canónica, `Store` con región y un pie "Tienda creada con
  TiendaTap · Crea la tuya gratis" que enlaza a la home (refuerza la marca).
- `/robots.txt` y `/sitemap.xml` (home, planes, registro y tiendas activas) generados por la app;
  `/llms.txt` con el resumen del servicio para asistentes de IA.
- Fuera del código (pendiente del dueño): Google Search Console y Bing Webmaster Tools (enviar
  sitemap), redirigir `www` en Cloudflare, decidir si permitir `GPTBot`/`ClaudeBot` (hoy Cloudflare
  los bloquea con 403) y presencia de marca en otros sitios.

### Imágenes (subida y estandarización)
- Todo archivo subido (fotos de producto, de variante y logos) pasa por `lib/services/imageService.js`:
  máximo **10 MB** (si pesa más se rechaza sin procesarlo, también por el encabezado
  `Content-Length`), se verifica que sea una imagen real (JPG, PNG, WebP, AVIF o GIF; SVG y archivos
  falsos se rechazan) y se normaliza con `sharp`: orientación EXIF corregida, metadatos (GPS
  incluido) eliminados, lado máximo **2048 px** sin agrandar las pequeñas y **WebP calidad 85**.
- Fotos de producto: se guarda `<nombre>_full.webp` y una miniatura `<nombre>_thumb.webp` (600 px,
  calidad 80) que usan la tarjeta, el dashboard y el buscador; el detalle y el lightbox cargan la
  completa. Logos: PNG de 512 px (conserva la transparencia y se ve bien al compartir el enlace).
- Menos de 500 px no se bloquea: la API responde `warnings`. Las imágenes anteriores no se tocan
  (sin miniatura se sirven tal cual). Los parámetros viven en `IMAGE_PRESETS`.
- `sharp` es dependencia declarada (`package.json`); antes solo venía como opcional de Next.

### Infra / calidad
- Migraciones Sequelize incrementales (`db/migrations/`), una por cambio de esquema.
- `revalidatePath` aplicado tras mutaciones (categorías, productos, reorder) para evitar
  caché stale en la tienda pública.

## Pendientes / decisiones abiertas

- **Mayoreo por variante**: no implementado, pospuesto hasta que un cliente lo pida. Hoy el
  mayoreo aplica al precio base del producto sin importar la variante seleccionada; el vendedor
  puede aclarar condiciones por variante en el campo de descripción. Ver detalle técnico en
  el modelo `ProductVariant` y `ProductDetailSheet.js` si se retoma.
- **Pagos in-app**: pendiente. Servirá para cobrar la suscripción a los vendors y, en Max, para
  que los clientes del vendor paguen con tarjeta. Hoy el plan se cambia manualmente desde admin.
- **Comisiones en Max**: se planea cobrar comisión por las ventas con pago in-app del plan Max
  (por definir). Mientras tanto, no prometer "sin comisiones" en textos, SEO ni `llms.txt`.
- **Vencimiento de la suscripción (anual)**: la fecha ya se guarda; falta lo que pasa con ella, que
  va junto con los pagos: 5 días antes de que termine hay que avisar al vendor y pedirle que
  registre sus datos de pago, y decidir qué pasa si no paga. Las tiendas legadas (las que existían al lanzar los planes, 2026-10-12) se quedan en Max
  y su primer año vence el **2027-10-12**; no se les baja de plan.
- (agregar aquí lo que vaya surgiendo)

## Changelog reciente

- **2026-10-27** — suscripciones (tarjetas con valores), servicio de productos, variantes que
  conservan su foto al editar, botón Planes del header en `outline`.
- **2026-10-12** — planes de suscripción Free / Plus / Max con límites de productos, categorías
  y funciones de producto; el admin asigna el plan y su vencimiento anual; página `/planes`.
- **2026-10-12** — SEO: metadatos, datos estructurados, sitemap, robots, `llms.txt` y enlace a
  TiendaTap en el pie de cada tienda.

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
