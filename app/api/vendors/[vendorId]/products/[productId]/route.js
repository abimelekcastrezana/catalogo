import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { uploadConfig } from '@/app/common/config.js';

export async function PUT(request, { params }) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolved = await params;
    const { vendorId, productId } = resolved;

    if (session.user.vendorId !== vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, sku, description, categoryId, isActive } = body;
    if (!name || !sku) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const product = await db.Product.findOne({ where: { id: productId, vendorId } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const existing = await db.Product.findOne({ where: { vendorId, sku, id: { [Op.ne]: productId } } });
    if (existing) {
      return NextResponse.json({ error: 'SKU already in use' }, { status: 409 });
    }

    await product.update({ name, sku, description, categoryId: categoryId || null, isActive: typeof isActive === 'boolean' ? isActive : product.isActive });
    return NextResponse.json({ product: product.get({ plain: true }) });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Server error updating product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolved = await params;
  const { vendorId, productId } = resolved;

  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const product = await db.Product.findOne({ where: { id: productId, vendorId } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // delete linked images in file system + db
  const images = await db.ProductImage.findAll({ where: { productId } });
  const basePath = path.join(uploadConfig.basePath, 'products', productId);

  images.forEach((img) => {
    const filePath = path.join(uploadConfig.basePath, img.path.replace('/uploads', ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });

  await db.ProductImage.destroy({ where: { productId } });
  await product.destroy();

  if (fs.existsSync(basePath)) {
    fs.rmSync(basePath, { recursive: true, force: true });
  }

  return NextResponse.json({ deleted: true });
}
