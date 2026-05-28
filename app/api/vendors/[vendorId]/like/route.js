import { NextResponse } from 'next/server';
import db from '@/db/index.js';

// Max 30 likes por IP en 24h (anti-spam entre tiendas distintas)
const IP_DAILY_LIMIT = 30;

function getIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request, { params }) {
  const { vendorId: slug } = await params;
  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let fingerprint;
  try {
    const body = await request.json();
    fingerprint = body?.fingerprint;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length > 64) {
    return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 });
  }

  const ip = getIp(request);

  // Verificar límite diario por IP
  if (ip !== 'unknown') {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { Op } = await import('sequelize');
    const ipCount = await db.VendorLike.count({
      where: { ip, createdAt: { [Op.gte]: since } },
    });
    if (ipCount >= IP_DAILY_LIMIT) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
  }

  // Intentar insertar — la constraint UNIQUE evita duplicados a nivel de BD
  try {
    await db.VendorLike.create({ vendorId: vendor.id, fingerprint, ip });
  } catch (err) {
    // Violación de unique constraint = ya dio like
    if (err.name === 'SequelizeUniqueConstraintError') {
      const count = await db.VendorLike.count({ where: { vendorId: vendor.id } });
      return NextResponse.json({ liked: true, count, alreadyLiked: true });
    }
    throw err;
  }

  const count = await db.VendorLike.count({ where: { vendorId: vendor.id } });
  return NextResponse.json({ liked: true, count });
}

export async function GET(request, { params }) {
  const { vendorId: slug } = await params;
  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const count = await db.VendorLike.count({ where: { vendorId: vendor.id } });

  const url = new URL(request.url);
  const fingerprint = url.searchParams.get('fingerprint');
  let liked = false;
  if (fingerprint) {
    liked = !!(await db.VendorLike.findOne({ where: { vendorId: vendor.id, fingerprint } }));
  }

  return NextResponse.json({ count, liked });
}

export async function DELETE(request, { params }) {
  const { vendorId: slug } = await params;
  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let fingerprint;
  try {
    const body = await request.json();
    fingerprint = body?.fingerprint;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length > 64) {
    return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 });
  }

  await db.VendorLike.destroy({ where: { vendorId: vendor.id, fingerprint } });

  const count = await db.VendorLike.count({ where: { vendorId: vendor.id } });
  return NextResponse.json({ liked: false, count });
}
