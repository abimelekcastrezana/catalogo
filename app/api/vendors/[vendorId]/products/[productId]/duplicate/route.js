import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vendorId, productId } = await params;
  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const original = await db.Product.findOne({
    where: { id: productId, vendorId },
    include: [{ model: db.ProductImage, order: [['position', 'ASC']] }],
  });
  if (!original) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const transaction = await db.sequelize.transaction();
  try {
    const copy = await db.Product.create({
      vendorId,
      categoryId: original.categoryId || null,
      name: `${original.name} (copia)`,
      sku: null,
      description: original.description,
      price: original.price,
      badge: original.badge || null,
      isActive: false,
      position: original.position,
    }, { transaction });

    const originalImages = original.ProductImages || [];
    for (const img of originalImages) {
      const ext = path.extname(img.path);
      const newFilename = `${Date.now()}-${img.position}${ext}`;
      const newRelPath = `/uploads/products/${copy.id}/${newFilename}`;
      const srcPath = path.join(uploadConfig.basePath, img.path.replace('/uploads', ''));
      const destDir = path.join(uploadConfig.basePath, 'products', copy.id);
      const destPath = path.join(destDir, newFilename);

      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(srcPath, destPath);
        await db.ProductImage.create({ productId: copy.id, path: newRelPath, position: img.position }, { transaction });
      }
    }

    await transaction.commit();
    const newProduct = await db.Product.findByPk(copy.id, {
      include: [{ model: db.ProductImage, order: [['position', 'ASC']] }],
    });
    return NextResponse.json({ product: newProduct.get({ plain: true }) }, { status: 201 });
  } catch (error) {
    await transaction.rollback();
    console.error('Error duplicating product:', error);
    return NextResponse.json({ error: 'Server error duplicating product' }, { status: 500 });
  }
}
