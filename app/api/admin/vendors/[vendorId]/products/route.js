import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import { createProduct } from '@/lib/services/productService';
import { serviceErrorResponse } from '@/lib/services/serviceError';

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { vendorId } = await params;
  try {
    const result = await createProduct(vendorId, await request.json());
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return serviceErrorResponse(error, 'Server error creating product');
  }
}
