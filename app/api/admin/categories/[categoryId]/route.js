import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

export async function PUT(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { vendorId, name, slug } = body;
  const categoryId = params.categoryId;

  if (!vendorId || !name || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const category = await db.Category.findByPk(categoryId);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const duplicate = await db.Category.findOne({ where: { vendorId, slug, id: { [db.sequelize.Op.ne]: categoryId } } });
  if (duplicate) {
    return NextResponse.json({ error: 'Category slug exists for this vendor' }, { status: 409 });
  }

  try {
    category.vendorId = vendorId;
    category.name = name;
    category.slug = slug;
    await category.save();
    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    console.error('Admin category update error:', error);
    return NextResponse.json({ error: 'Server error updating category' }, { status: 500 });
  }
}
