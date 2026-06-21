# PLAN de implementación de la API (Next.js + Sequelize + NextAuth)

## 1. Validación inicial de entorno(REALIZADO)
- Verificar existencia de `package.json`, `db/`, `app/`.
- Confirmar `npm install` sin errores en contenedor.
- Verificar `db/connection.js` carga `app/common/config.js` y se conecta a Postgres.

## 2. Modelos y migraciones (REALIZADO)
- Asegurar modelos en `db/models/`:
  - `User`, `Vendor`, `Category`, `Product`, `ProductImage`, `Cart`, `CartItem`.
- Confirmar `db/index.js` exporta sequelize + modelos y se importan relaciones.
- Crear migración única `db/migrations/20260402-init-schema.js` que construye todas las tablas y constraints.

## 3. Configuración de NextAuth
- Crear `/app/api/auth/[...nextauth]/route.js`.
- Usar `CredentialsProvider` con `email/password` y bcrypt.
- JWT+Session callbacks devuelven `user.id`, `vendorId`, `email`.
- Verificar ruta `POST /api/auth/login` funciona con Credenciales.

## 4. Rutas de autenticación
- `POST /api/auth/register`: crea vendor + user (hash bcrypt, validate input).
- `POST /api/auth/login`: delegar a NextAuth (route de NextAuth).

## 5. Rutas públicas
- `GET /api/vendors`.
- `GET /api/vendors/[slug]`.
- `GET /api/vendors/[slug]/categories`.
- `GET /api/vendors/[slug]/products[?categoryId]`.

## 6. Rutas protegidas (requieren session)
- Middleware `lib/auth/getSession.js` para leer session con `next-auth`.
- `POST /api/vendors/[vendorId]/categories`.
- `POST /api/vendors/[vendorId]/products`.
- `POST /api/products/[productId]/images`.
- Validar `session.user.vendorId === vendorId` donde aplica.

## 7. Rutas de carrito (guest)
- `POST /api/carts` crea `guestKey` (UUID) y cart activo.
- `GET /api/carts/[guestKey]` trae cart e items.
- `POST /api/carts/[guestKey]/items` agrega item o actualiza cantidad.
- `PATCH /api/carts/[guestKey]/items/[productId]` modifica cantidad.
- `DELETE /api/carts/[guestKey]/items/[productId]` elimina.

## 8. Upload de imagenes
- `POST /api/products/[productId]/images` `multipart/form-data`.
- Validar max 2 imágenes, guardar en `/public/uploads/products/{productId}/`.
- Guardar registro en `product_images`.

## 9. Checkout WhatsApp
- `GET /api/carts/[guestKey]/checkout`.
- Construir texto con cada item, brand, quantity.
- Responder URL `https://wa.me/{vendorWhatsapp}?text={encoded}`.

## 10. Tests y ejemplos (api.http)
- Construir casos de prueba para todas las rutas.
- Probar registro/login, endpoints públicos, routes protegidas, carrito, imagenes, checkout.

## 11. Ajustes finales
- `app/common/config.js` carga `.env` y `.env.[env]`.
- Documentar en `README.md` cómo arrancar y migrar (`npx sequelize-cli db:migrate`).
- Opcional: añadir `npm run db:migrate` en `devcontainer.json`.
