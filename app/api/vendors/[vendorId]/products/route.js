import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { UniqueConstraintError } from 'sequelize';
import db from '@/db/index.js';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  if (session.user.vendorId !== resolvedParams.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, sku, description, categoryId, price, wholesalePrice, wholesaleMinQty, wholesaleDescription, variants } = body;
  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const vendorId = resolvedParams.vendorId;
  const normalizedSku = sku ? sku.trim() : null;
  const normalizedPrice = Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }

  try {
    const maxPositionResult = await db.Product.findOne({
      where: { vendorId },
      order: [['position', 'DESC']],
      attributes: ['position'],
    });
    const nextPosition = (maxPositionResult?.position ?? -1) + 1;

    const product = await db.Product.create({
      vendorId,
      categoryId: categoryId || null,
      name,
      sku: normalizedSku,
      description,
      price: normalizedPrice,
      position: nextPosition,
      wholesalePrice: wholesalePrice ? Number(wholesalePrice) : null,
      wholesaleMinQty: wholesaleMinQty ? parseInt(wholesaleMinQty, 10) : null,
      wholesaleDescription: wholesaleDescription || null,
    });

    let createdVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      createdVariants = await Promise.all(
        variants.map((v, i) =>
          db.ProductVariant.create({
            productId: product.id,
            name: v.name,
            price: v.price ? Number(v.price) : null,
            position: i,
          })
        )
      );
    }

    return NextResponse.json({ product, variants: createdVariants.map(v => v.get({ plain: true })) }, { status: 201 });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return NextResponse.json({ error: 'Constraint error' }, { status: 409 });
    }
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Server error creating product' }, { status: 500 });
  }
}
