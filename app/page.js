import db from '@/db/index.js';
import { Op } from 'sequelize';
import HomeClient from '@/app/components/HomeClient';

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = (resolvedSearchParams?.search || '').trim().toLowerCase();
  const region = (resolvedSearchParams?.region || '').trim().toLowerCase();

  const where = { isActive: true };

  const orClauses = [];

  if (search) {
    orClauses.push(
      { name: { [Op.iLike]: `%${search}%` } },
      { slug: { [Op.iLike]: `%${search}%` } },
      { slogan: { [Op.iLike]: `%${search}%` } },
      { tag1: { [Op.iLike]: `%${search}%` } },
      { tag2: { [Op.iLike]: `%${search}%` } },
      { state: { [Op.iLike]: `%${search}%` } },
      { city: { [Op.iLike]: `%${search}%` } },
    );
  }

  if (region) {
    orClauses.push(
      { state: { [Op.iLike]: `%${region}%` } },
      { city: { [Op.iLike]: `%${region}%` } },
    );
  }

  if (orClauses.length > 0) {
    where[Op.or] = orClauses;
  }

  const vendorModels = await db.Vendor.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });

  const vendors = vendorModels
    .map((v) => v.get({ plain: true }))
    .filter((v) => v.slug !== 'gatunoide');

  // Etiquetas de todas las tiendas activas (para los chips de filtro rápido)
  const tagRows = await db.Vendor.findAll({ attributes: ['tag1', 'tag2', 'slug'], where: { isActive: true } });
  const tags = [...new Set(
    tagRows
      .filter((v) => v.slug !== 'gatunoide')
      .flatMap((v) => [v.tag1, v.tag2])
      .map((t) => (t || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'es'));

  const whatsappPhone = (process.env.CONTACT_WHATSAPP || '+524622222741').replace(/[^0-9+]/g, '').replace(/^\+/, '');

  return <HomeClient vendors={vendors} tags={tags} search={search} region={region} whatsappPhone={whatsappPhone} />;
}
