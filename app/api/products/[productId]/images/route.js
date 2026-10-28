import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import { assertUploadSize, removeImage, storeImage } from '@/lib/services/imageService';
import { serviceErrorResponse } from '@/lib/services/serviceError';

export const maxDuration = 60;

async function parseForm(request) {
  const formData = await request.formData();
  const files = formData.getAll('image');
  const rawPositions = formData.getAll('replacePosition');
  const positions = rawPositions.map((value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  });
  return { files, positions };
}

export async function POST(request, { params }) {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assParams = await params;
    const productId = assParams.productId;

    const product = await db.Product.findByPk(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const isProductOwner = product.vendorId === session.user.vendorId;
    const isAdmin = session.user.role === 'admin';
    if (!isProductOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    assertUploadSize(request);
    const existingImages = await db.ProductImage.findAll({ where: { productId } });

    const { files, positions } = await parseForm(request);
    if (!files.length) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const saved = [];
    const warnings = [];
    let nextPosition = existingImages.length ? Math.max(...existingImages.map((img) => img.position || 0)) + 1 : 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const replacePosition = positions[i];
      const targetPosition = replacePosition || nextPosition;

      if (!replacePosition && existingImages.length >= 2) {
        return NextResponse.json({ error: 'Max 2 images allowed' }, { status: 400 });
      }

      const stored = await storeImage(file, { dir: `products/${productId}`, name: `image_${Date.now()}_${i}` });
      if (stored.warning) warnings.push(stored.warning);

      if (replacePosition) {
        const existing = existingImages.find((img) => img.position === replacePosition);
        if (existing) {
          await removeImage(existing.path);
          await db.ProductImage.destroy({ where: { id: existing.id } });
        }
        await db.ProductImage.create({ productId, path: stored.path, position: targetPosition });
      } else {
        await db.ProductImage.create({ productId, path: stored.path, position: targetPosition });
        nextPosition += 1;
      }

      saved.push({ productId, path: stored.path, position: targetPosition });
    }

    return NextResponse.json(warnings.length ? { saved, warnings } : { saved });
  } catch (error) {
    return serviceErrorResponse(error, 'Server error uploading image');
  }
}
