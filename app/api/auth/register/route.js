import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

async function getDb() {
  const dbModule = await import('../../../../db/index.js');
  const db = dbModule.default || dbModule;
  return db;
}

export async function POST(request) {
  const { Vendor, User } = await getDb();
  const body = await request.json();
  const { email, password, vendorName, slug, whatsappPhone } = body;
  // El registro público siempre crea vendedores; los admin se asignan fuera de este endpoint.
  const userRole = 'vendor';

  if (!email || !password || !vendorName || !slug || !whatsappPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const slugRegex = /^[A-Za-z0-9-]+$/;
  const existingVendor = await Vendor.findOne({ where: { slug } });
  if (existingVendor) {
    return NextResponse.json({ error: 'Vendor slug already exists' }, { status: 409 });
  }
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug. Only letters, numbers and hyphens allowed.' }, { status: 400 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const transaction = await Vendor.sequelize.transaction();

  try {
    const newVendor = await Vendor.create({
      name: vendorName,
      slug,
      whatsappPhone,
    }, { transaction });

    const newUser = await User.create({
      email,
      password: hashedPassword,
      vendorId: newVendor.id,
      role: userRole,
    }, { transaction });

    await transaction.commit();

    return NextResponse.json({
      user: { id: newUser.id, email: newUser.email, vendorId: newVendor.id },
      vendor: { id: newVendor.id, slug: newVendor.slug, name: newVendor.name },
    }, { status: 201 });
  } catch (error) {
    await transaction.rollback();
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: error.errors?.[0]?.message || 'Validation error' }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error creating account' }, { status: 500 });
  }
}
