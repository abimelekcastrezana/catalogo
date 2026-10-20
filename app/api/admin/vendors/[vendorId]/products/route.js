import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { UniqueConstraintError } from 'sequelize';
import db from '@/db/index.js';
import { getVendorPlan, productLimitError, descriptionLimitError, productFieldsForPlan } from '@/lib/plan-limits';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const { vendorId } = resolvedParams;

  const body = await request.json();
  const { name, sku, description, price, variants } = body;

  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const normalizedSku = sku ? sku.trim() : null;
  const normalizedPrice = Number(price);
  if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
    return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
  }

  const plan = await getVendorPlan(vendorId);
  if (!plan) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  const limitError = await productLimitError(vendorId, plan);
  if (limitError) return NextResponse.json({ error: limitError }, { status: 403 });
  const descriptionError = descriptionLimitError(plan, description);
  if (descriptionError) return NextResponse.json({ error: descriptionError }, { status: 400 });

  if (plan.fullProductFeatures && normalizedSku) {
    const existing = await db.Product.findOne({ where: { vendorId, sku: normalizedSku } });
    if (existing) {
      return NextResponse.json({ error: 'SKU already exists for this vendor' }, { status: 409 });
    }
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
      position: nextPosition,
      ...productFieldsForPlan(plan, body),
    });

    let createdVariants = [];
    if (plan.fullProductFeatures && Array.isArray(variants) && variants.length > 0) {
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
      return NextResponse.json({ error: 'SKU already exists for this vendor' }, { status: 409 });
    }
    console.error('Admin vendor product create error:', error);
    return NextResponse.json({ error: 'Server error creating product' }, { status: 500 });
  }
}
