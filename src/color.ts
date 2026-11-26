export type RGB = [number,number,number];
export type Sample = {rgb:RGB; spread:number; clipped:number};
// Experimental image heuristics, not clinical or instrument accuracy thresholds.
export const QUALITY = {maxSpread:18,maxClipped:0.2,maxDistance:22,minMargin:3} as const;
export function lab(rgb:RGB):RGB {
 const [r,g,b]=rgb.map(v=>{const s=v/255;return s<=0.04045?s/12.92:((s+0.055)/1.055)**2.4;});
 const f=(v:number)=>v>216/24389?Math.cbrt(v):(24389/27*v+16)/116;
 const x=f((r*.4124564+g*.3575761+b*.1804375)/.95047);
 const y=f(r*.2126729+g*.7151522+b*.072175);
 const z=f((r*.0193339+g*.119192+b*.9503041)/1.08883);
 return [116*y-16,500*(x-y),200*(y-z)];
}
export function delta(a:RGB,b:RGB) {return Math.hypot(...a.map((v,i)=>v-b[i]));}
function median(values:number[]) {values.sort((a,b)=>a-b);return values[Math.floor(values.length/2)];}
export function samplePixels(data:Uint8ClampedArray):Sample {
 const pixels:RGB[]=[];
 for(let i=0;i<data.length;i+=4) if(data[i+3]>250) pixels.push([data[i],data[i+1],data[i+2]]);
 if(pixels.length<25) throw new Error('Selecciona una zona más grande dentro del parche.');
 const rgb=pixels[0].map((_,i)=>median(pixels.map(p=>p[i]))) as RGB;
 return {rgb,spread:median(pixels.map(p=>delta(lab(p),lab(rgb)))),clipped:pixels.filter(p=>p.every(v=>v>247)||p.every(v=>v<8)).length/pixels.length};
}
export type Analysis = {status:'ok';ph:number;distance:number} | {status:'incomplete'|'poor'|'ambiguous';reason:string};
export function analyze(references:Map<number,Sample>,strip:Sample|undefined):Analysis {
 if(!strip||Array.from({length:14},(_,i)=>i+1).some(n=>!references.has(n))) return {status:'incomplete',reason:'Selecciona los 14 colores y la tira antes de analizar.'};
 if([...references.values(),strip].some(s=>s.spread>QUALITY.maxSpread||s.clipped>QUALITY.maxClipped)) return {status:'poor',reason:'Hay zonas poco uniformes, demasiado oscuras o sobreexpuestas. Ajusta las selecciones o repite la foto.'};
 const ranking=[...references].map(([ph,s])=>({ph,distance:delta(lab(strip.rgb),lab(s.rgb))})).sort((a,b)=>a.distance-b.distance);
 if(ranking[0].distance>QUALITY.maxDistance||ranking[1].distance-ranking[0].distance<QUALITY.minMargin) return {status:'ambiguous',reason:'El color no coincide suficientemente con una referencia o se parece a varias. Revisa las selecciones o repite la foto con luz uniforme.'};
 return {status:'ok',...ranking[0]};
}
