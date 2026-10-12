import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { uploadConfig } from '@/app/common/config.js';
import { getVendorPlan, descriptionLimitError, productFieldsForPlan } from '@/lib/plan-limits';

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
    const { name, description, isActive, price, variants } = body;
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

    const plan = await getVendorPlan(vendorId);
    // Solo se valida si cambió, para no bloquear productos creados en un plan anterior.
    const descriptionError = description !== product.description && descriptionLimitError(plan, description);
    if (descriptionError) return NextResponse.json({ error: descriptionError }, { status: 400 });

    await product.update({
      ...productFieldsForPlan(plan, body),
      isActive: typeof isActive === 'boolean' ? isActive : product.isActive,
    });

    let updatedVariants = [];
    if (plan.fullProductFeatures && Array.isArray(variants)) {
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
