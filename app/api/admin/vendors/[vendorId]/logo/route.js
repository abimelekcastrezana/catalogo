import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import { assertUploadSize, removeImage, storeImage } from '@/lib/services/imageService';
import { serviceErrorResponse } from '@/lib/services/serviceError';

export const maxDuration = 60;

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const vendorId = resolvedParams.vendorId;
  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  try {
    assertUploadSize(request);
    const formData = await request.formData();
    const logoFile = formData.get('logo');
    if (!logoFile || typeof logoFile.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'Logo no enviado' }, { status: 400 });
    }

    const stored = await storeImage(logoFile, { dir: `vendors/${vendorId}`, name: `logo_${Date.now()}`, preset: 'logo' });

    if (vendor.logoUrl && vendor.logoUrl.startsWith('/uploads')) await removeImage(vendor.logoUrl);
    vendor.logoUrl = stored.path;
    await vendor.save();
  } catch (error) {
    return serviceErrorResponse(error, 'Server error uploading logo');
  }

  return NextResponse.json({ vendor }, { status: 200 });
}
