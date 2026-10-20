import { NextResponse } from 'next/server';
import { isReservedSlug, RESERVED_SLUG_ERROR } from '@/app/lib/reserved-slugs';
import { getUserSession } from '@/lib/auth/getSession';
import bcrypt from 'bcrypt';
import db from '@/db/index.js';
import { PLAN_KEYS, DEFAULT_PLAN, isValidDateOnly, resolvePlanExpiry } from '@/app/lib/plans';

export async function POST(request) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, whatsappPhone, slogan, tag1, tag2, email, password, plan = DEFAULT_PLAN, planExpiresAt } = body;

  const slugRegex = /^[A-Za-z0-9-]+$/;
  if (!name || !slug || !whatsappPhone || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!PLAN_KEYS.includes(plan)) {
    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
  }
  if (planExpiresAt && !isValidDateOnly(planExpiresAt)) {
    return NextResponse.json({ error: 'Fecha de vencimiento inválida' }, { status: 400 });
  }
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ error: 'Slug inválido. Solo letras, números y guiones.' }, { status: 400 });
  }

  if (isReservedSlug(slug)) {
    return NextResponse.json({ error: RESERVED_SLUG_ERROR }, { status: 400 });
  }

  const existingVendor = await db.Vendor.findOne({ where: { slug } });
  if (existingVendor) {
    return NextResponse.json({ error: 'Vendor slug already exists' }, { status: 409 });
  }

  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const transaction = await db.sequelize.transaction();
  try {
    const vendor = await db.Vendor.create({ name, slug, whatsappPhone, slogan, tag1, tag2, plan, planExpiresAt: resolvePlanExpiry(plan, planExpiresAt), isActive: true }, { transaction });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.User.create({ email, password: hashedPassword, vendorId: vendor.id, role: 'vendor' }, { transaction });
    await transaction.commit();
    return NextResponse.json({ vendor, user }, { status: 201 });
  } catch (error) {
    await transaction.rollback();
    console.error('Admin vendor creation error:', error);
    return NextResponse.json({ error: 'Server error creating vendor' }, { status: 500 });
  }
}
