import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db from '../../../../db';
const { Vendor, User } = db;

export async function POST(request) {
  const body = await request.json();
  const { email, password, vendorName, slug, whatsappPhone } = body;

  if (!email || !password || !vendorName || !slug || !whatsappPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const existingVendor = await Vendor.findOne({ where: { slug } });
  if (existingVendor) {
    return NextResponse.json({ error: 'Vendor slug already exists' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newVendor = await Vendor.create({
    name: vendorName,
    slug,
    whatsappPhone,
  });

  const newUser = await User.create({
    email,
    password: hashedPassword,
    vendorId: newVendor.id,
  });

  return NextResponse.json({
    user: { id: newUser.id, email: newUser.email, vendorId: newVendor.id },
    vendor: { id: newVendor.id, slug: newVendor.slug, name: newVendor.name },
  }, { status: 201 });
}
