import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import { Sequelize } from 'sequelize';

export async function PUT(request, { params }) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const vendorId = resolvedParams.vendorId;
  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, slug, whatsappPhone, slogan, state, city } = body;

  if (!name || !slug || !whatsappPhone) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  // Check slug uniqueness for others
  const existingSlug = await db.Vendor.findOne({ where: { slug, id: { [Sequelize.Op.ne]: vendorId } } });
  if (existingSlug) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
  }

  await vendor.update({ name, slug, whatsappPhone, slogan, state: state || null, city: city || null });
  const vendorPlain = vendor.get({ plain: true });

  return NextResponse.json({ vendor: vendorPlain }, { status: 200 });
}
