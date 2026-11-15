# Fondo de recuerdo con el robot

Estado: implementada, falta la revisión en móviles reales (pedida por el usuario el 15 de noviembre de 2026; aprobada el mismo día con una imagen fija de 1440 × 3200).

## Problema

Al terminar de limpiar el móvil no queda nada en él que recuerde a Poda. El usuario pide: «se podría instalar un fondo de Poda, si el usuario quiere», como recuerdo, «con el robot de la portada», y que «la imagen se deje para que el usuario lo ponga».

Sin root, Poda no puede leer ni guardar el fondo que la persona tiene ahora. Si lo cambiara, no podría devolverlo, y eso choca con la regla de que todo se puede deshacer ([AGENTS.md](../../AGENTS.md)). Por eso Poda **no cambia el fondo**: deja la imagen en el móvil y explica cómo ponerla.

Comportamiento actual: no existe nada parecido. Poda no escribe ningún archivo en el móvil.

## Requisitos

- **R-001** Al terminar de quitar o desactivar apps, Poda ofrece, como algo opcional, dejar en el móvil un fondo de pantalla de recuerdo.
  - CA-1: La oferta sale solo al final, después de los resultados y de «Antes y después» (specs/009). Nunca antes de quitar ni dentro de la elección de perfil.
  - CA-2: No se copia nada al móvil hasta que la persona lo pide pulsando un botón (en la web) o diciendo que sí (con el asistente).
  - CA-3: El texto explica que su fondo actual no cambia y que la imagen solo queda guardada en la galería.
- **R-002** Al aceptar, Poda copia la imagen a la carpeta de imágenes del móvil (`Pictures/Poda/`), de forma que aparece en la galería.
  - CA-1: El fondo actual no cambia y no se abre ninguna pantalla del sistema.
  - CA-2: Si se pide dos veces, la imagen se sustituye; no se acumulan copias.
  - CA-3: Si no se puede copiar, Poda lo dice en una frase y no reintenta. El resto del resultado no se ve afectado.
- **R-003** Después de copiarla, Poda explica paso a paso cómo ponerla de fondo desde la galería («Galería» › la imagen › «Establecer como fondo»), con los nombres de los botones de la marca del móvil cuando los conoce (Xiaomi, Samsung, OPPO) y una versión general para el resto.
- **R-004** La imagen es el robot de la portada con la cara contenta, sobre el fondo de papel de Poda, en vertical. Deja espacio libre arriba para el reloj y abajo para los iconos, y no lleva más texto que «Poda» en pequeño.
- **R-005** Las tres vías lo ofrecen igual: la web, el servidor MCP y la línea de comandos. `PROMPT.md` lo incluye en el paso final como oferta opcional, con las mismas reglas.
- **R-006** La imagen va del ordenador al móvil y a ningún otro sitio. Restaurar no la borra (restaurar nunca quita nada); las instrucciones dicen cómo borrarla desde la galería si no la quiere.
- **R-007** Textos en los cinco idiomas.

## Fuera de alcance

- Poner el fondo automáticamente: sin root no se puede sin perder el fondo actual.
- Guardar o restaurar el fondo que tenía la persona.
- Huawei con HarmonyOS NEXT, donde Poda no se conecta.

## Preguntas abiertas

- ¿La pantalla del robot muestra el número de apps quitadas («23 fuera»)? Lo haría un recuerdo personal, pero obliga a generar la imagen en cada vía en lugar de copiar una fija. Propuesta: primera versión con una imagen fija; el número, más adelante.
- Tamaño: una sola imagen vertical de 1440 × 3200 o adaptarla a la pantalla del móvil (`wm size`). Propuesta: una sola, porque la galería la recorta al ponerla.

## Pruebas

- R-001 CA-1 y CA-2: la oferta no existe en la pantalla de elegir perfil ni antes de confirmar (prueba de la web en el modo de ejemplo).
- R-002: «010 R-002» en `apps/mcp/test/` con un móvil simulado: la ruta es fija, se sustituye y no se ejecuta nada más.
- R-007: «010 R-007» en `apps/web/test/textos.test.mjs`.
- Revisión en móviles reales: OPPO A54 5G (ColorOS) y al menos un Xiaomi o un Samsung. La imagen sale en la galería y se puede poner de fondo con los pasos de R-003.
