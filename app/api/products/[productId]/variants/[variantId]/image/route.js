import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';

export const maxDuration = 60;

export async function POST(request, { params }) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, variantId } = await params;

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const isProductOwner = product.vendorId === session.user.vendorId;
    const isAdmin = session.user.role === 'admin';
    if (!isProductOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const variant = await db.ProductVariant.findOne({ where: { id: variantId, productId } });
    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const variantDir = path.join(uploadConfig.basePath, 'products', productId, 'variants', variantId);
    fs.mkdirSync(variantDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.jpg';
    const filename = `variant_${Date.now()}${ext}`;
    const filepath = path.join(variantDir, filename);
    fs.writeFileSync(filepath, buffer);

    const imagePath = `/uploads/products/${productId}/variants/${variantId}/${filename}`;

    // Remove old image file if exists
    if (variant.imagePath) {
      const oldRelative = variant.imagePath.replace(/^\/uploads/, '').replace(/^\//, '');
      const oldFilePath = path.join(uploadConfig.basePath, oldRelative);
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    }

    await variant.update({ imagePath });

    return NextResponse.json({ imagePath });
  } catch (error) {
    console.error('Variant image upload error:', error);
    return NextResponse.json({ error: 'Server error uploading variant image' }, { status: 500 });
  }
}
