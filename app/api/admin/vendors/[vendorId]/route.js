import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import db from '@/db/index.js';

export async function PUT(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const body = await request.json();
  const { name, slug, whatsappPhone, slogan, tag1, tag2, cardColor, backgroundColor, isActive, email, newPassword } = body;
  const vendorId = resolvedParams.vendorId;
  const slugRegex = /^[A-Za-z0-9-]+$/;

  if (!name || !slug || !whatsappPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ error: 'Slug inválido. Solo letras, números y guiones.' }, { status: 400 });
  }

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const duplicate = await db.Vendor.findOne({ where: { slug, id: { [Op.ne]: vendorId } } });
  if (duplicate) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 });
  }

  const currentUser = await db.User.findOne({ where: { vendorId } });
  if (email) {
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser && existingUser.vendorId !== vendorId) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
  }

  try {
    vendor.name = name;
    vendor.slug = slug;
    vendor.whatsappPhone = whatsappPhone;
    vendor.slogan = slogan;
    vendor.tag1 = tag1;
    vendor.tag2 = tag2;
    vendor.cardColor = cardColor;
    vendor.backgroundColor = backgroundColor;
    vendor.isActive = Boolean(isActive);
    await vendor.save();

    if (email) {
      if (currentUser) {
        currentUser.email = email;
        if (newPassword) {
          currentUser.password = await bcrypt.hash(newPassword, 10);
        }
        await currentUser.save();
      } else if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.User.create({ email, password: hashedPassword, vendorId, role: 'vendor' });
      }
    }

    return NextResponse.json({ vendor, user: currentUser || null }, { status: 200 });
  } catch (error) {
    console.error('Admin vendor update error:', error);
    return NextResponse.json({ error: 'Server error updating vendor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const vendorId = resolvedParams.vendorId;
  const vendor = await db.Vendor.findByPk(vendorId);

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const transaction = await db.sequelize.transaction();
  try {
    const productIds = (await db.Product.findAll({ where: { vendorId }, attributes: ['id'], transaction })).map((p) => p.id);
    if (productIds.length) {
      await db.ProductImage.destroy({ where: { productId: productIds }, transaction });
    }

    const cartIds = (await db.Cart.findAll({ where: { vendorId }, attributes: ['id'], transaction })).map((c) => c.id);
    if (cartIds.length) {
      await db.CartItem.destroy({ where: { cartId: cartIds }, transaction });
    }

    await db.Cart.destroy({ where: { vendorId }, transaction });
    await db.Product.destroy({ where: { vendorId }, transaction });
    await db.Category.destroy({ where: { vendorId }, transaction });
    await db.User.destroy({ where: { vendorId }, transaction });
    await vendor.destroy({ transaction });

    await transaction.commit();
    return NextResponse.json({ message: 'Vendor deleted' }, { status: 200 });
  } catch (error) {
    await transaction.rollback();
    console.error('Admin vendor delete error:', error);
    return NextResponse.json({ error: 'Server error deleting vendor' }, { status: 500 });
  }
}
