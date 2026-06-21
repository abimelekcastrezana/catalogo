# Spec 01 — Variantes de producto y precio mayoreo

## Estado: En progreso (mayoreo por variante pendiente)

---

## Variantes

### Definición
Un producto puede tener N variantes opcionales. Cada variante tiene:
- **Nombre** (requerido) — ej. "Azul", "Grande", "Mermelada de fresa"
- **Precio** (opcional) — si se define, reemplaza el precio base del producto al seleccionarla
- **Foto** (opcional) — si se define, se muestra primero al seleccionar la variante

### Comportamiento en la tienda (cliente)
- Las variantes aparecen como chips/botones seleccionables en el detalle del producto
- Seleccionar una variante es **opcional** — sin selección se agrega el producto base
- Al seleccionar una variante:
  - El precio mostrado cambia al de la variante (si tiene), o se mantiene el base
  - Si la variante tiene foto, esa foto aparece primero en el carrusel
  - Al agregar al carrito: `id = productId_variant_variantId`, `name = "Producto — Variante"`
- Se pueden agregar al carrito tanto el producto base como variantes individuales de forma independiente

### Comportamiento en el dashboard (vendedor)
- En "Nuevo producto" y "Editar producto": sección "Variantes" con botón "+ Agregar variante"
- Cada fila de variante: nombre | precio (opcional) | foto (opcional) | botón quitar
- Al guardar: se reemplazan todas las variantes del producto (delete + re-create)
- Las fotos de variante se suben por separado después de guardar el producto

---

## Precio mayoreo

### Definición
Campo opcional a nivel de producto (no por variante — ver pendientes). Tiene:
- **Precio unitario mayoreo** — precio por pieza en compra mayorista
- **Cantidad mínima** — número mínimo de piezas para precio mayoreo
- **Descripción** — el vendedor explica condiciones del trato

### Comportamiento en la tienda (cliente)
- Si el producto tiene precio mayoreo, aparece un badge/botón "Mayoreo" junto al precio
- Al activarlo:
  - El precio mostrado cambia al **precio del lote completo** = `cantidadMínima × precioUnitarioMayoreo`
  - Debajo se muestra el desglose: `N piezas × $X.XX c/u` + descripción del vendedor
  - Al agregar al carrito: `name = "Producto (Mayoreo)"`, `price = precioLote`, cada unidad en carrito = 1 lote
  - En el carrito: muestra `c/lote` en vez de `c/u`
- Al desactivar mayoreo: vuelve al precio unitario normal, cada + agrega 1 pieza

### Comportamiento en el dashboard (vendedor)
- En "Nuevo producto" y "Editar": sección colapsable "Precio mayoreo (opcional)"
- Campos: precio mayoreo | cantidad mínima | descripción del trato
- Si no se llena, no se muestra en la tienda

---

## Pendientes / Decisiones abiertas

### Mayoreo por variante
**Estado:** No implementado — decidido posponer hasta que un cliente lo pida.

**Especificación futura:**
- Cada variante podría tener su propio `wholesalePrice`, `wholesaleMinQty`, `wholesaleDescription`
- Requeriría:
  - Añadir columnas a `product_variants`
  - UI en el formulario de variantes (fila más compleja o panel expansible por variante)
  - Lógica en `ProductDetailSheet`: el mayoreo activo aplicaría al precio de la variante seleccionada, no al precio base del producto

**Por ahora:** el mayoreo del producto aplica independientemente de la variante seleccionada, usando el precio base del producto para el cálculo del lote. El vendedor puede aclarar condiciones por variante en `wholesaleDescription`.

---

## Modelo de datos

```
Product
  wholesalePrice      DECIMAL(10,2) NULL
  wholesaleMinQty     INTEGER NULL
  wholesaleDescription TEXT NULL

ProductVariant
  id          UUID PK
  productId   UUID FK → products (CASCADE)
  name        STRING
  price       DECIMAL(10,2) NULL
  imagePath   STRING NULL
  position    INTEGER DEFAULT 0
```

## Archivos clave
- `db/models/product.js` — campos wholesale
- `db/models/productVariant.js` — modelo variante
- `db/migrations/20260621-add-product-variants-and-wholesale.js`
- `app/components/ProductDetailSheet.js` — UI cliente
- `app/components/CartDrawer.js` — c/u vs c/lote
- `app/dashboard/products/AddProductForm.js` — form crear
- `app/dashboard/products/ProductRow.js` — form editar
- `app/api/products/[productId]/variants/[variantId]/image/route.js` — subida foto variante
