import db from '@/db/index.js';
import { Op } from 'sequelize';
import HomeClient from '@/app/components/HomeClient';
import JsonLd from '@/app/components/JsonLd';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, SITE_LOGO, HIDDEN_SLUGS } from '@/app/lib/site';

const PAGE_SIZE = 12;
const MAX_TAGS = 10;

export const metadata = {
  alternates: { canonical: '/' },
};

const STRUCTURED_DATA = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE_LOGO}`,
    description: SITE_DESCRIPTION,
    areaServed: 'MX',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'es-MX',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
];

export default async function HomePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const search = (resolvedSearchParams?.search || '').trim().toLowerCase();
  const region = (resolvedSearchParams?.region || '').trim().toLowerCase();

  const rawPage = parseInt(resolvedSearchParams?.page ?? '1', 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, 50);

  const where = { isActive: true, slug: { [Op.notIn]: HIDDEN_SLUGS } };

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

  // "Cargar más": cada página trae todo lo anterior + 12, así el botón solo cambia ?page=
  // Tiendas en línea primero, luego las más recientes. Solo las columnas que usa la tarjeta.
  const { rows, count: total } = await db.Vendor.findAndCountAll({
    where,
    attributes: ['id', 'name', 'slug', 'logoUrl', 'slogan', 'tag1', 'tag2', 'isOnline', 'state', 'city'],
    order: [['isOnline', 'DESC'], ['createdAt', 'DESC']],
    limit: page * PAGE_SIZE,
  });

  const vendors = rows.map((v) => v.get({ plain: true }));

  // Etiquetas de todas las tiendas activas (para los chips de filtro rápido)
  // Solo las más usadas: el resto se encuentra con el buscador
  const tagRows = await db.Vendor.findAll({
    attributes: ['tag1', 'tag2'],
    where: { isActive: true, slug: { [Op.notIn]: HIDDEN_SLUGS } },
  });
  const tagCount = new Map();
  for (const t of tagRows.flatMap((v) => [v.tag1, v.tag2]).map((t) => (t || '').trim()).filter(Boolean)) {
    const key = t.toLowerCase();
    const prev = tagCount.get(key);
    tagCount.set(key, { label: prev?.label || t, n: (prev?.n || 0) + 1 });
  }
  const tags = [...tagCount.values()]
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, 'es'))
    .slice(0, MAX_TAGS)
    .map((t) => t.label);

  const whatsappPhone = (process.env.CONTACT_WHATSAPP || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');

  return (
    <>
      <JsonLd data={STRUCTURED_DATA} />
      <HomeClient
        vendors={vendors}
        total={total}
        page={page}
        tags={tags}
        search={search}
        region={region}
        whatsappPhone={whatsappPhone}
      />
    </>
  );
}
