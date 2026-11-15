# Plan: fondo de recuerdo

## Imagen (R-004)

- Una sola imagen PNG vertical de 1440 × 3200, generada en la compilación a partir del mismo SVG del robot (`apps/web/components/Robot.tsx`, expresión `feliz`), como ya se hace con `icono-512.png` y `og.png` (`lib/og.tsx`). Así no hay un dibujo distinto que mantener.
- Fondo `--fondo` (#efede7), robot centrado entre el 30 % y el 75 % del alto, «Poda» en pequeño debajo, en `--tinta` al 40 %.
- Se publica en `apps/web/out/poda-fondo.png` (la web la descarga de su propio sitio) y se copia a `apps/mcp/dist/` en la compilación del MCP (el MCP no se conecta a internet).

## Copiarla al móvil (R-002)

- Ruta fija: `/sdcard/Pictures/Poda/poda-fondo.png`. No entra ningún dato del usuario en la línea de shell, así que no hay riesgo de inyección; aun así, la ruta va como constante en `@poda/nucleo` y no se construye.
- Web: `Movil` gana `copiarArchivo(ruta, datos)` con el canal *sync* de ya-webadb. El modo de ejemplo lo imita.
- MCP y línea de comandos: `adb push` a esa ruta. Herramienta MCP `dejar_fondo` y orden `poda fondo`.
- Para que salga en la galería sin esperar: avisar al escáner de medios. En Android 10 o superior el aviso clásico (`MEDIA_SCANNER_SCAN_FILE`) está obsoleto y no todas las marcas lo respetan: hay que probarlo en los móviles reales. Si no aparece, las instrucciones dicen que puede tardar unos minutos o que se busque en la carpeta «Poda» de «Archivos».

## Ofrecerla (R-001, R-003)

- Web: bloque nuevo al final de los resultados, debajo de «Antes y después» y junto a «Compartir resultado», con un botón «Guardar el fondo en el móvil». Tras copiar, los pasos para ponerlo según la marca de `info` (ya se conoce por `ro.product.manufacturer`).
- `PROMPT.md`, paso 6: después de probar llamada, teclado y alarma, ofrecerlo con una pregunta cerrada. Si acepta, `dejar_fondo` y los pasos de R-003.

## Textos (R-007)

- Claves nuevas en `apps/web/textos/*.ts` (`fondo.*`), en los cinco idiomas.

## Pruebas

| Requisito | Prueba |
|---|---|
| R-001 | Modo de ejemplo: la oferta solo aparece tras los resultados. |
| R-002 | «010 R-002» (`apps/mcp/test/`): ruta fija, sustituye, nada más. |
| R-004 | Revisión visual de `out/poda-fondo.png`. |
| R-007 | «010 R-007» (`apps/web/test/textos.test.mjs`). |
| Todo | OPPO A54 5G y un Xiaomi o Samsung reales. |
