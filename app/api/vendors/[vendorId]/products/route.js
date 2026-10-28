import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { createProduct } from '@/lib/services/productService';
import { serviceErrorResponse } from '@/lib/services/serviceError';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vendorId } = await params;
  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const result = await createProduct(vendorId, await request.json());
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error, 'Server error creating product');
  }
}
