import { Op } from 'sequelize';
import db from '@/db/index.js';
import { SITE_URL, HIDDEN_SLUGS } from '@/app/lib/site';

// Se arma en cada request: las tiendas cambian y la BD no está disponible en el build.
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const vendors = await db.Vendor.findAll({
    where: { isActive: true, slug: { [Op.notIn]: HIDDEN_SLUGS } },
    attributes: ['slug', 'updatedAt'],
    order: [['createdAt', 'ASC']],
  });

  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/planes`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/register`, changeFrequency: 'yearly', priority: 0.5 },
    ...vendors.map((v) => ({
      url: `${SITE_URL}/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    })),
  ];
}
