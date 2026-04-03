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
  return files;
}

export async function POST(request, { params }) {
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

  const count = await db.ProductImage.count({ where: { productId } });
  if (count >= 2) {
    return NextResponse.json({ error: 'Max 2 images allowed' }, { status: 400 });
  }

  const files = await parseForm(request);
  if (!files.length) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const totalToSave = Math.min(2 - count, files.length);
  const saved = [];

  const basePath = uploadConfig.basePath;
  const productDir = path.join(basePath, 'products', productId);
  fs.mkdirSync(productDir, { recursive: true });

  for (let i = 0; i < totalToSave; i++) {
    const file = files[i];
    if (!file || typeof file.arrayBuffer !== 'function') continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || '.jpg';
    const filename = `image_${Date.now()}_${i}${ext}`;
    const filepath = path.join(productDir, filename);

    fs.writeFileSync(filepath, buffer);

    const relPath = path.join('/uploads/products', productId, filename);
    const productImage = await db.ProductImage.create({ productId, path: relPath, position: count + i + 1 });
    saved.push(productImage);
  }

  return NextResponse.json({ saved });
}
