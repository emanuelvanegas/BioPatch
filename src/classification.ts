export const PROTOCOL_VERSION = 'experimental-1';
export const DISCLAIMER = 'Los intervalos sirven para demostrar el funcionamiento del software. No son umbrales clínicos validados para diagnosticar infecciones.';
export const LEVELS = [
 {min:4,max:6,tone:'acid',title:'Nivel 1 — Ácido',message:'La muestra presenta un ambiente ácido. En estudios de heridas, la acidificación progresiva puede asociarse con una evolución favorable de la cicatrización.',note:'No descarta infección.'},
 {min:7,max:7,tone:'neutral',title:'Nivel 2 — Neutro',message:'La muestra presenta un pH cercano a la neutralidad. Se recomienda comparar este resultado con mediciones anteriores para observar su evolución.',note:'No confirma ni descarta infección.'},
 {min:8,max:9,tone:'alkaline',title:'Nivel 3 — Alcalino',message:'Se detectó un ambiente alcalino. Estudios científicos han asociado la alcalinidad persistente con heridas crónicas, retraso en la cicatrización y determinadas infecciones. Se recomienda valoración profesional si existen signos clínicos de infección.',note:'Este nivel rojo representa una alerta de seguimiento, no una infección confirmada ni su gravedad.'}
] as const;
export function classify(ph:number) {
 if(!Number.isInteger(ph)||ph<1||ph>14) throw new Error('El pH debe ser un entero entre 1 y 14.');
 return LEVELS.find(level=>ph>=level.min&&ph<=level.max) ?? {tone:'outside',title:'Fuera del intervalo experimental de referencia',message:'Repite la medición y comprueba la selección de la tira y la tabla.',note:'Sin interpretación clínica automática.'};
}
