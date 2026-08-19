import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { Op } from 'sequelize';
import db from '@/db/index.js';

export async function PATCH(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { vendorId, categoryId } = await params;
  const body = await request.json();
  const { name, slug } = body;
  if (!name || !slug) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const category = await db.Category.findOne({ where: { id: categoryId, vendorId } });
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const duplicate = await db.Category.findOne({
    where: { vendorId, slug, id: { [Op.ne]: categoryId } },
  });
  if (duplicate) {
    return NextResponse.json({ error: 'Category slug exists' }, { status: 409 });
  }

  category.name = name;
  category.slug = slug;
  await category.save();
  return NextResponse.json({ category }, { status: 200 });
}

export async function DELETE(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { vendorId, categoryId } = await params;
  const category = await db.Category.findOne({ where: { id: categoryId, vendorId } });
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  await category.destroy();
  return NextResponse.json({ success: true }, { status: 200 });
}
