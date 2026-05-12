import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';

export const maxDuration = 60;

export async function POST(request, { params }) {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const vendorId = resolvedParams.vendorId;

  if (session.user.vendorId !== vendorId && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const logoFile = formData.get('logo');
  if (!logoFile || typeof logoFile.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'Logo no enviado' }, { status: 400 });
  }

  const basePath = uploadConfig.basePath;
  const vendorDir = path.join(basePath, 'vendors', vendorId);
  fs.mkdirSync(vendorDir, { recursive: true });

  const ext = path.extname(logoFile.name) || '.png';
  const filename = `logo_${Date.now()}${ext}`;
  const filepath = path.join(vendorDir, filename);
  const buffer = Buffer.from(await logoFile.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  if (vendor.logoUrl && vendor.logoUrl.startsWith('/uploads')) {
    const oldRelative = vendor.logoUrl.replace(/^\/uploads\/?/, '');
    const oldPath = path.join(basePath, oldRelative);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  vendor.logoUrl = `/uploads/vendors/${vendorId}/${filename}`;
  await vendor.save();

  return NextResponse.json({ vendor }, { status: 200 });
}
