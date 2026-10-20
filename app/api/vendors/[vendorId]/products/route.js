import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { UniqueConstraintError } from 'sequelize';
import db from '@/db/index.js';
import { getVendorPlan, productLimitError, descriptionLimitError, productFieldsForPlan } from '@/lib/plan-limits';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  if (session.user.vendorId !== resolvedParams.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, price, variants } = body;
  if (!name || price === undefined || price === null) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const vendorId = resolvedParams.vendorId;
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
      return NextResponse.json({ error: 'Constraint error' }, { status: 409 });
    }
    console.error('Product create error:', error);
    return NextResponse.json({ error: 'Server error creating product' }, { status: 500 });
  }
}
