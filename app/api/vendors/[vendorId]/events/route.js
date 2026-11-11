import { NextResponse } from 'next/server';
import db from '@/db/index.js';

const ALLOWED_TYPES = ['visit', 'product_view', 'whatsapp_click'];

// Ruta pública: la tienda registra aquí lo que hacen los visitantes.
// [vendorId] es en realidad el slug de la tienda (igual que en la ruta de likes).
export async function POST(request, { params }) {
  const { vendorId: slug } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const { type, productId } = body || {};
  if (!ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const vendor = await db.Vendor.findOne({ where: { slug } });
  if (!vendor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let validProductId = null;
  if (type === 'product_view') {
    if (typeof productId !== 'string') {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }
    // El producto debe pertenecer a ESTA tienda (no confiamos en lo que manda el navegador).
    const product = await db.Product.findOne({ where: { id: productId, vendorId: vendor.id } });
    if (!product) return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    validProductId = product.id;
  }

  await db.StoreEvent.create({ vendorId: vendor.id, type, productId: validProductId });
  return NextResponse.json({ ok: true }, { status: 201 });
}