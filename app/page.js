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

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return <HomeClient vendors={vendors} search={search} region={region} baseUrl={baseUrl} />;
}
