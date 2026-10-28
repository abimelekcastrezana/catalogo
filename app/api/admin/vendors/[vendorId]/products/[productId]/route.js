import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';
import { updateProduct } from '@/lib/services/productService';
import { serviceErrorResponse } from '@/lib/services/serviceError';

export async function PUT(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { vendorId, productId } = await params;
  try {
    return NextResponse.json(await updateProduct(vendorId, productId, await request.json()));
  } catch (error) {
    return serviceErrorResponse(error, 'Server error updating product');
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
