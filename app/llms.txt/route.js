import { PLANS } from '@/app/lib/plans';
import { SITE_URL, SITE_NAME } from '@/app/lib/site';

// Resumen de TiendaTap para asistentes de IA (formato llms.txt). Los planes salen de app/lib/plans.js.
// No prometer "sin comisiones": se planean comisiones para pagos in-app en Max (docs/PROJECT.md).
export function GET() {
  const { free, plus, max } = PLANS;
  const body = `# ${SITE_NAME}

> ${SITE_NAME} es una plataforma mexicana para crear la tienda en línea (catálogo digital) de un negocio local de forma gratuita. El negocio sube sus productos con fotos y precios, comparte su enlace (${SITE_URL}/nombre-del-negocio) y sus clientes arman un carrito y envían el pedido directo al WhatsApp del negocio. No requiere apps ni conocimientos de páginas web.

## Para quién es

- Negocios locales y emprendedores en México que venden por WhatsApp y redes sociales: comida, belleza, ropa, regalos, servicios, hogar y más.
- Quien busca crear una tienda en línea gratis o un catálogo digital con pedidos por WhatsApp.

## Planes (precios anuales en pesos mexicanos)

- Plan ${free.label} (gratis): hasta ${free.maxProducts} productos; cada producto con 2 fotos, nombre, descripción corta y precio; sin categorías.
- Plan ${plus.label} ($${plus.priceMxn} MXN al año): hasta ${plus.maxProducts} productos y ${plus.maxCategories} categorías; variantes, precio de mayoreo y etiquetas.
- Plan ${max.label} ($${max.priceMxn} MXN al año): productos y categorías sin límite y todas las funciones. Próximamente: pagos con tarjeta dentro de ${SITE_NAME}.

## Funciones

- Tienda pública con enlace propio, buscador, categorías y carrito.
- Pedidos enviados al WhatsApp del negocio con el detalle de productos.
- Directorio de tiendas por estado en la página principal.
- Panel para que el negocio administre productos, categorías y la información de su tienda.

## Enlaces

- [Inicio y directorio de tiendas](${SITE_URL}/)
- [Planes y precios](${SITE_URL}/planes)
- [Crear una tienda gratis](${SITE_URL}/register)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
