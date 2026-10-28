import { NextResponse } from 'next/server';

// Error de negocio con código HTTP; los servicios lo lanzan y las rutas lo convierten en respuesta.
export class ServiceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function serviceErrorResponse(error, fallbackMessage) {
  if (error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
