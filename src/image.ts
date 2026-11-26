export const MAX_BYTES=20*1024*1024;
export async function decode(file:File):Promise<HTMLCanvasElement> {
 if(file.size>MAX_BYTES) throw new Error('La imagen supera 20 MB. Selecciona una imagen más pequeña.');
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Usa una imagen JPG, PNG o WebP. Convierte HEIC a JPG antes de cargarla.');
 const url=URL.createObjectURL(file);
 try {
  const img=new Image(); img.src=url; await img.decode();
  if(img.naturalWidth*img.naturalHeight>40_000_000) throw new Error('La imagen supera 40 megapíxeles. Reduce su resolución.');
  if(Math.min(img.naturalWidth,img.naturalHeight)<150) throw new Error('La imagen es demasiado pequeña. Usa una foto de mayor resolución.');
  const scale=Math.min(1,1800/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx) throw new Error('Tu navegador no permite procesar imágenes.');
  ctx.drawImage(img,0,0,canvas.width,canvas.height);return canvas;
 } catch(error) {if(error instanceof DOMException) throw new Error('No se pudo leer la imagen. Prueba con otro archivo JPG o PNG.');throw error;} finally {URL.revokeObjectURL(url);}
}
