import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

export async function PATCH(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const resolvedParams = await params;
  if (session.user.vendorId !== resolvedParams.vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { ids } = body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Missing or invalid ids array' }, { status: 400 });
  }

  try {
    const categories = await db.Category.findAll({ where: { vendorId: resolvedParams.vendorId } });
    const categoryIds = new Set(categories.map(c => c.id));

    for (const id of ids) {
      if (!categoryIds.has(id)) {
        return NextResponse.json({ error: 'Invalid category id' }, { status: 400 });
      }
    }

    for (let i = 0; i < ids.length; i++) {
      await db.Category.update({ position: i }, { where: { id: ids[i] } });
    }

    // Invalidar el caché de la página pública del vendedor
    const vendor = await db.Vendor.findByPk(resolvedParams.vendorId);
    if (vendor) {
      revalidatePath(`/${vendor.slug}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Category reorder error:', error);
    return NextResponse.json({ error: 'Server error reordering categories' }, { status: 500 });
  }
}
