// Datos del sitio para SEO (metadatos, sitemap, datos estructurados, llms.txt).
export const SITE_URL = (process.env.NEXTAUTH_URL || 'https://tiendatap.com').replace(/\/$/, '');
export const SITE_NAME = 'TiendaTap';
export const SITE_TITLE = 'TiendaTap: crea tu tienda en línea gratis con pedidos por WhatsApp';
export const SITE_DESCRIPTION =
  'Crea el catálogo en línea de tu negocio gratis: sube tus productos, comparte tu enlace y recibe los pedidos directo en tu WhatsApp. Planes Free, Plus y Max.';
export const SITE_LOGO = '/tiendatap_logo.jpg';

// Tiendas que no se listan en la home ni en el sitemap.
export const HIDDEN_SLUGS = ['gatunoide'];
