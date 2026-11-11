import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/getSession';
import db from '@/db/index.js';

// Solo letras, números, punto, guion y guion bajo (así nadie guarda un enlace malicioso).
const HANDLE = /^[A-Za-z0-9._-]{1,50}$/;

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const cleanHandle = (v) => clean(v, 60).replace(/^@/, '');

export async function PUT(request, { params }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { vendorId } = await params;
  if (session.user.vendorId !== vendorId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const about = clean(body.about, 600);
  const address = clean(body.address, 200);
  const hours = clean(body.hours, 300);
  const instagram = cleanHandle(body.instagram);
  const facebook = cleanHandle(body.facebook);

  if (instagram && !HANDLE.test(instagram)) {
    return NextResponse.json({ error: 'Usuario de Instagram inválido' }, { status: 400 });
  }
  if (facebook && !HANDLE.test(facebook)) {
    return NextResponse.json({ error: 'Usuario de Facebook inválido' }, { status: 400 });
  }

  const vendor = await db.Vendor.findByPk(vendorId);
  if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

  await vendor.update({
    about: about || null,
    address: address || null,
    hours: hours || null,
    instagram: instagram || null,
    facebook: facebook || null,
  });

  return NextResponse.json({ ok: true });
}