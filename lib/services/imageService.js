import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { uploadConfig } from '@/app/common/config.js';
import { ServiceError } from '@/lib/services/serviceError';
import { MAX_UPLOAD_BYTES, formatMegabytes as mb, thumbPath } from '@/app/lib/images';

// Se rechaza lo que pese más de MAX_UPLOAD_BYTES (no se intenta procesar) y todo lo aceptado se normaliza.
// Por debajo de este lado (px) se avisa que la imagen es chica, sin bloquear.
export const MIN_RECOMMENDED_SIDE = 500;
// Protege la memoria contra imágenes con una cantidad absurda de píxeles.
const MAX_INPUT_PIXELS = 100_000_000;
const ACCEPTED_FORMATS = ['jpeg', 'png', 'webp', 'gif', 'heif'];
const INVALID_IMAGE = 'El archivo no es una imagen válida. Usa JPG, PNG, WebP o AVIF.';

export const IMAGE_PRESETS = {
  // Fotos de producto: WebP, lado máximo 2048 px y calidad 85 (casi sin diferencia visible).
  product: { format: 'webp', maxSide: 2048, quality: 85, thumb: { side: 600, quality: 80 } },
  // Logo: PNG para conservar la transparencia y verse bien al compartir el enlace.
  logo: { format: 'png', maxSide: 512, thumb: null },
};

// Rechaza antes de leer el cuerpo si el tamaño declarado ya excede el límite (con margen para
// los encabezados multipart). Evita cargar en memoria un archivo enorme.
export function assertUploadSize(request, maxBytes = MAX_UPLOAD_BYTES) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes + 512 * 1024) {
    throw new ServiceError(413, `La imagen pesa más de ${mb(maxBytes)}. Reduce su tamaño e inténtalo de nuevo.`);
  }
}

async function normalize(buffer, { format, maxSide, quality }) {
  const pipeline = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error' })
    .rotate() // aplica la orientación EXIF (fotos de celular); los metadatos, GPS incluido, no se conservan
    .resize({ width: maxSide, height: maxSide, fit: 'inside', withoutEnlargement: true });
  return format === 'png'
    ? pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true })
    : pipeline.webp({ quality }).toBuffer({ resolveWithObject: true });
}

// Valida, normaliza y guarda una imagen subida.
// `dir` es relativo a UPLOAD_PATH (p. ej. "products/<id>"); `name` va sin extensión.
// Devuelve { path, width, height, bytes, warning } con `path` en formato "/uploads/...".
export async function storeImage(file, { dir, name, preset = 'product', withThumb = true }) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new ServiceError(400, 'No file provided');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ServiceError(413, `La imagen pesa ${mb(file.size)}; el máximo es ${mb(MAX_UPLOAD_BYTES)}.`);
  }

  const options = IMAGE_PRESETS[preset];
  const input = Buffer.from(await file.arrayBuffer());

  let meta;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch (error) {
    throw new ServiceError(400, /pixel limit/i.test(error.message) ? 'La imagen tiene demasiados píxeles.' : INVALID_IMAGE);
  }
  if (!ACCEPTED_FORMATS.includes(meta.format)) throw new ServiceError(400, INVALID_IMAGE);

  let main;
  let thumb = null;
  try {
    main = await normalize(input, options);
    if (withThumb && options.thumb) {
      thumb = await normalize(input, { format: 'webp', maxSide: options.thumb.side, quality: options.thumb.quality });
    }
  } catch {
    // Formato reconocido pero que no se pudo decodificar (archivo dañado o códec no incluido, p. ej. HEIC).
    throw new ServiceError(400, INVALID_IMAGE);
  }

  const mainName = options.format === 'png' ? `${name}.png` : `${name}_full.webp`;
  const absoluteDir = path.join(uploadConfig.basePath, dir);
  await fs.mkdir(absoluteDir, { recursive: true });
  const relative = `/uploads/${dir}/${mainName}`;
  await fs.writeFile(path.join(absoluteDir, mainName), main.data);
  if (thumb) await fs.writeFile(path.join(uploadConfig.basePath, thumbPath(relative).replace(/^\/uploads/, '')), thumb.data);

  const small = Math.max(meta.width || 0, meta.height || 0) < MIN_RECOMMENDED_SIDE;
  return {
    path: relative,
    width: main.info.width,
    height: main.info.height,
    bytes: main.info.size,
    warning: small ? `La imagen es pequeña (menos de ${MIN_RECOMMENDED_SIDE} px); puede verse borrosa.` : null,
  };
}

// Borra una imagen guardada y su miniatura (si la tiene). No falla si ya no existe.
export async function removeImage(storedPath) {
  if (!storedPath) return;
  const targets = new Set([storedPath, thumbPath(storedPath)]);
  await Promise.all([...targets].map((p) =>
    fs.rm(path.join(uploadConfig.basePath, p.replace(/^\/uploads/, '')), { force: true })
  ));
}
