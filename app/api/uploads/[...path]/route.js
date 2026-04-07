import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { uploadConfig } from '@/app/common/config.js';

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(request, { params }) {
  const { path: segments = [] } = await params;
  const filePath = path.join(uploadConfig.basePath, ...segments);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
