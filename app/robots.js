import { SITE_URL } from '@/app/lib/site';

// En runtime: SITE_URL sale de NEXTAUTH_URL, que puede no existir en el build.
export const dynamic = 'force-dynamic';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      // /api/uploads sirve las fotos de productos y logos: se permite para imágenes y previews.
      allow: ['/', '/api/uploads/'],
      disallow: ['/admin', '/dashboard', '/api/', '/login', '/logout'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
