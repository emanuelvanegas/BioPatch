import { samplePixels, type Sample } from './color.ts';

export const REFERENCE_VERSION = 'tabla-fotografiada-v1';
export const STORED_REFERENCE_NOTE = 'Referencia guardada: tabla fotografiada del prototipo. Las diferencias de luz y cámara entre ambas fotos aumentan la incertidumbre. No es una calibración instrumental.';
const referenceUrl = new URL('../tabladecolores.png', import.meta.url).href;
let cached: Map<number, Sample> | undefined;

/** Centers verified against tabladecolores.png (705 × 540), excluding borders and labels. */
export async function loadStoredReferences(): Promise<Map<number, Sample>> {
  if (cached) return new Map(cached);
  try {
    const image = new Image();
    image.src = referenceUrl;
    await image.decode();
    if (image.naturalWidth !== 705 || image.naturalHeight !== 540) {
      throw new Error('La tabla guardada ha cambiado. Revisa sus zonas de referencia.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('No se puede procesar la tabla guardada.');
    context.drawImage(image, 0, 0);
    const references = new Map<number, Sample>();
    const centers = [60, 160, 260, 360, 460, 560, 660];
    for (let column = 0; column < centers.length; column++) {
      for (let row = 0; row < 2; row++) {
        const ph = column * 2 + row + 1;
        const y = row === 0 ? 100 : 430;
        references.set(ph, samplePixels(context.getImageData(centers[column] - 15, y - 15, 30, 30).data));
      }
    }
    cached = references;
    return new Map(references);
  } catch {
    // Do not cache failures or silently substitute invented colors.
    throw new Error('No se pudo cargar la tabla de referencia guardada. Reintenta cargando la foto o elige «Tira y tabla» para seleccionar las referencias manualmente.');
  }
}
