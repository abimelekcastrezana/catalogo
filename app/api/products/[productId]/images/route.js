import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    if (product.vendorId !== session.user.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingImages = await db.ProductImage.findAll({ where: { productId } });

    const { files, positions } = await parseForm(request);
    if (!files.length) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const basePath = uploadConfig.basePath;
    const productDir = path.join(basePath, 'products', productId);
    fs.mkdirSync(productDir, { recursive: true });

    const saved = [];
    let nextPosition = existingImages.length ? Math.max(...existingImages.map((img) => img.position || 0)) + 1 : 1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const replacePosition = positions[i];
      const targetPosition = replacePosition || nextPosition;

      if (!replacePosition && existingImages.length >= 2) {
        return NextResponse.json({ error: 'Max 2 images allowed' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || '.jpg';
      const filename = `image_${Date.now()}_${i}${ext}`;
      const filepath = path.join(productDir, filename);

      fs.writeFileSync(filepath, buffer);

      const relPath = path.join('/uploads/products', productId, filename);

      if (replacePosition) {
        const existing = existingImages.find((img) => img.position === replacePosition);
        if (existing) {
          const relativeExistingPath = existing.path.replace(/^\/uploads/, '').replace(/^\//, '');
          const existingFilePath = path.join(uploadConfig.basePath, relativeExistingPath);
          if (fs.existsSync(existingFilePath)) fs.unlinkSync(existingFilePath);
          await db.ProductImage.destroy({ where: { id: existing.id } });
        }
        await db.ProductImage.create({ productId, path: relPath, position: targetPosition });
      } else {
        await db.ProductImage.create({ productId, path: relPath, position: targetPosition });
        nextPosition += 1;
      }

      saved.push({ productId, path: relPath, position: targetPosition });
    }

    return NextResponse.json({ saved });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ error: 'Server error uploading image' }, { status: 500 });
  }
}
