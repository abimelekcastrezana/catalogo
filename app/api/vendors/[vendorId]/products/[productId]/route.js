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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vendorId, productId } = await params;
  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    return NextResponse.json(await updateProduct(vendorId, productId, await request.json()));
  } catch (error) {
    return serviceErrorResponse(error, 'Server error updating product');
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
