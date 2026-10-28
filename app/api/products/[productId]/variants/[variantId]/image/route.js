import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import { assertUploadSize, removeImage, storeImage } from '@/lib/services/imageService';
import { serviceErrorResponse } from '@/lib/services/serviceError';

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

    assertUploadSize(request);
    const formData = await request.formData();
    const stored = await storeImage(formData.get('image'), {
      dir: `products/${productId}/variants/${variantId}`,
      name: `variant_${Date.now()}`,
      withThumb: false,
    });

    // Se reemplaza la foto anterior de la variante.
    const previous = variant.imagePath;
    await variant.update({ imagePath: stored.path });
    await removeImage(previous);

    return NextResponse.json(stored.warning ? { imagePath: stored.path, warnings: [stored.warning] } : { imagePath: stored.path });
  } catch (error) {
    return serviceErrorResponse(error, 'Server error uploading variant image');
  }
}
