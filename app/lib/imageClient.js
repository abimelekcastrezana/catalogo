// Preparación de imágenes en el navegador, antes de subirlas. No se importa desde el servidor.
import { MAX_IMAGE_SIDE } from '@/app/lib/images';

const HEIC_UNSUPPORTED = 'Este navegador no puede leer fotos HEIC. Usa Safari o convierte la foto a JPG.';

// Las fotos del iPhone pueden venir en HEIC (a veces al elegirlas desde la app Archivos).
export function isHeic(file) {
  return /^image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

// Safari sabe decodificar HEIC; se dibuja en un canvas y se exporta como JPG (95% de los casos
// quedan bajo 1 MB al reducir a MAX_IMAGE_SIDE, lo mismo que haría el servidor después).
async function heicToJpeg(file) {
  const url = URL.createObjectURL(file);
  try {
    let source;
    let width;
    let height;
    try {
      source = await createImageBitmap(file); // aplica la orientación EXIF
      ({ width, height } = source);
    } catch {
      const img = new Image();
      img.src = url;
      await img.decode();
      source = img;
      width = img.naturalWidth;
      height = img.naturalHeight;
    }

    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) throw new Error('canvas vacío');
    return new File([blob], `${file.name.replace(/\.(heic|heif)$/i, '')}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Devuelve el mismo archivo, o un JPG si era HEIC. Lanza un Error con mensaje para el usuario
// si el navegador no puede convertirlo.
export async function prepareImageFile(file) {
  if (!file || !isHeic(file)) return file;
  try {
    return await heicToJpeg(file);
  } catch {
    throw new Error(HEIC_UNSUPPORTED);
  }
}
