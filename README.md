# BioPatch

Prototipo local de estimación de pH por color. Sin IA, cuentas, historial ni backend. Las fotografías permanecen en memoria en el navegador; recargar la página las descarta. No hay analítica ni fuentes remotas.

## Desarrollo

Requiere Node.js 22.18+ (o Node 24/26) y npm.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

`npm run build` verifica TypeScript y genera `dist/`. No se ha publicado el proyecto. Vite preview sirve para revisión local, no como servidor de producción.

## Uso

1. Por defecto, **Solo la tira** usa la tabla guardada `tabladecolores.png`. Sube la foto de tu tira, selecciona su zona coloreada, confirma y pulsa Estimar pH. No necesitas marcar las 14 referencias.
2. Opcionalmente, selecciona **Tira y tabla** e incluye ambas en la foto. Selecciona y confirma los 14 parches (impares arriba, pares abajo), luego la tira. Este modo comparte iluminación entre muestra y referencias.
3. Puedes ampliar y ajustar la zona: flechas para mover, Mayús para acelerar y Enter para confirmar. Cambiar de modo descarta selecciones y resultado, pero conserva la fotografía para volver a seleccionar.
4. Usa JPG, PNG o WebP de hasta 20 MB y 40 megapíxeles. Respeta el tiempo de lectura del fabricante. Las fotos se reducen a una dimensión máxima de 1800 píxeles.

`src/reference.ts` carga la tabla guardada como un recurso local incluido en la compilación y toma muestras de 30 × 30 píxeles en centros revisados (impares y pares). Las coordenadas corresponden únicamente a la fotografía actual de 705 × 540 píxeles. Sustituirla requiere revisar las coordenadas y actualizar su versión. Si falla la carga, el análisis queda deshabilitado y se ofrece reintentar o usar la tabla de la misma foto. No se inventan colores de reemplazo.

La referencia guardada es una fotografía, **no una calibración instrumental**. Las diferencias de luz, cámara y balance de blancos entre fotos aumentan la incertidumbre. Ambos modos conservan los mismos criterios de rechazo; no se relajan para forzar un resultado. Colores cercanos pueden seguir dando resultados no concluyentes. `tiras.png` continúa como documentación, fuera de la compilación.

## Cámara en un móvil

`localhost` permite usar cámara en el propio equipo. En otro dispositivo, una URL HTTP de red local no es un contexto seguro: usa HTTPS con un certificado confiable para el teléfono, mediante un proxy local configurado por el desarrollador. No basta con aceptar un certificado inválido. No se incluye un túnel público ni se publica automáticamente. La carga de archivos sigue disponible cuando no se puede acceder a la cámara. El stream se cierra al capturar, cancelar, ocultar o abandonar la página.

## Método y límites

- Mediana RGB por canal de la región seleccionada, conversión sRGB a CIELAB D65 y distancia euclidiana Delta E 76.
- Coincidencia con los 14 parches de la tabla guardada o de la misma foto, según el modo elegido. No hay interpolación ni decimales. El método presupone sRGB y no realiza calibración instrumental de cámara.
- Heurísticas experimentales en `src/color.ts`: dispersión mediana máxima 18 Delta E, fracción recortada máxima 20%, distancia al candidato máxima 22 y separación mínima frente al segundo candidato de 3. No son umbrales clínicos, no constituyen confianza probabilística y requieren ajuste con datos reales.
- Se detectan ciertas regiones no uniformes y exposición extrema; no se garantiza detectar desenfoque, sombras uniformes, filtros o referencias mal etiquetadas. El usuario debe revisar la foto y las selecciones. Una imagen inadecuada puede pasar estas heurísticas.
- La limitación de megapíxeles se verifica después de decodificar con el navegador. La cota de archivo se aplica antes; no garantiza evitar picos de memoria durante decodificación.
- Se necesita validar con muestras de pH conocido, varias cámaras e iluminaciones. Reportar error absoluto, matriz de confusión, rechazos y desempeño por categoría con datos independientes antes de declarar precisión. Las pruebas sintéticas comprueban software, no exactitud de medición.

## Clasificación experimental v1

`src/classification.ts` centraliza configuración y textos: 4–6 ácido (verde), 7 neutro (amarillo), 8–9 alcalino (rojo). 1–3 y 10–14 quedan fuera del intervalo experimental y solicitan repetir sin interpretación clínica. Fallos y resultados ambiguos nunca activan categorías. No se aceptan valores fraccionarios en la clasificación.

Los intervalos sirven para demostrar el funcionamiento del software. No son umbrales clínicos validados para diagnosticar infecciones. Verde no descarta infección; rojo no la confirma ni mide su gravedad. Una lectura aislada no establece tendencias. La comparación con mediciones anteriores es externa porque no existe historial.

## Fundamento

[Weigelt et al. (2022), Advanced Wound Diagnostics: Toward Transforming Wound Care into Precision Medicine](https://pmc.ncbi.nlm.nih.gov/articles/PMC8982127/), sección pH. Describe asociaciones entre pH y cicatrización y limitaciones de su interpretación aislada. El rango 4–6 corresponde a piel normal; no valida nuestro semáforo ni demuestra que una herida esté sana. La adecuación de estas tiras para exudado y la precisión de este método no están demostradas.

## Estructura

- `src/main.ts`: interfaz, captura y selección, sin persistencia.
- `src/image.ts`: validación y decodificación local.
- `src/color.ts`: muestras, comparación y calidad experimental.
- `src/classification.ts`: clasificación y mensajes versionados.
- `tests/analysis.test.ts`: pruebas unitarias de límites, comparación y rechazo.

## Verificación realizada

Nueve pruebas unitarias y compilación TypeScript/Vite correctas. Verificación automatizada en navegador de carga de un PNG sintético, selección de 14 referencias y tira, resultado pH 8, corrección mediante teclado e invalidación del resultado, rechazo de archivo corrupto y ausencia de desbordamiento a 320, 390, 768 y 1440 px. No se ha probado una cámara física ni validado precisión con muestras reales.
