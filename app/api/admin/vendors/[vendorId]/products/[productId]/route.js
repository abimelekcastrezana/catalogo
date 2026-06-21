import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';

export async function PUT(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const { vendorId, productId } = resolved;
  const body = await request.json();
  const { name, sku, description, categoryId, isActive, price, wholesalePrice, wholesaleMinQty, wholesaleDescription, variants } = body;

  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const normalizedPrice = Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }

  const product = await db.Product.findOne({ where: { id: productId, vendorId } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const normalizedSku = sku ? sku.trim() : null;
  if (normalizedSku && normalizedSku !== product.sku) {
    const existingSku = await db.Product.findOne({ where: { vendorId, sku: normalizedSku } });
    if (existingSku) {
      return NextResponse.json({ error: 'SKU already exists for this vendor' }, { status: 409 });
    }
  }

  try {
    await product.update({
      name, sku: normalizedSku, description, categoryId: categoryId || null,
      isActive: typeof isActive === 'boolean' ? isActive : product.isActive,
      price: normalizedPrice,
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
      wholesaleMinQty: wholesaleMinQty ? parseInt(wholesaleMinQty, 10) : null,
      wholesaleDescription: wholesaleDescription || null,
    });

    let updatedVariants = [];
    if (Array.isArray(variants)) {
      await db.ProductVariant.destroy({ where: { productId } });
      updatedVariants = await Promise.all(
        variants.map((v, i) =>
          db.ProductVariant.create({
            productId,
            name: v.name,
            price: v.price ? Number(v.price) : null,
            position: i,
          })
        )
      );
    }

    return NextResponse.json({ product: product.get({ plain: true }), variants: updatedVariants.map(v => v.get({ plain: true })) });
  } catch (error) {
    console.error('Admin vendor product update error:', error);
    return NextResponse.json({ error: 'Server error updating product' }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolved = await params;
  const { vendorId, productId } = resolved;
  const product = await db.Product.findOne({ where: { id: productId, vendorId } });
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const transaction = await db.sequelize.transaction();
  try {
    const images = await db.ProductImage.findAll({ where: { productId }, transaction });
    const basePath = path.join(uploadConfig.basePath, 'products', productId);

    images.forEach((img) => {
      const filePath = path.join(uploadConfig.basePath, img.path.replace('/uploads', ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    await db.ProductImage.destroy({ where: { productId }, transaction });
    await product.destroy({ transaction });

    if (fs.existsSync(basePath)) {
      fs.rmSync(basePath, { recursive: true, force: true });
    }

    await transaction.commit();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    await transaction.rollback();
    console.error('Admin vendor product delete error:', error);
    return NextResponse.json({ error: 'Server error deleting product' }, { status: 500 });
  }
}
