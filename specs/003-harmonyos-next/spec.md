# Apps de serie en HarmonyOS NEXT

Estado: fase A implementada (15 de noviembre de 2026). Las fases B, C y D quedan aparcadas: no hay móvil con HarmonyOS NEXT para probar.

## Problema

Los Huawei con HarmonyOS NEXT (5 o superior) ya no son Android: no tienen adb ni `pm`, y Poda les dice hoy «no compatible» (COMPATIBILIDAD.md, PROMPT.md, aviso de la ficha). Sus dueños también tienen apps de serie que no quieren y no tienen ninguna herramienta pensada para gente no técnica.

## Lo que sabemos (investigación del 15 de noviembre de 2026)

| Pregunta | Respuesta | Fuente |
|---|---|---|
| ¿Hay algo como adb? | Sí: `hdc` (HarmonyOS Device Connector), con modo desarrollador y depuración USB activados en el móvil | Documentación de Huawei y de OpenHarmony |
| ¿Hace falta cuenta de desarrollador? | No aparece en ninguna fuente; parece que basta con activar el modo desarrollador en el móvil. **Sin confirmar** | Soporte de Huawei |
| ¿Cómo se quita una app? | `bm uninstall -n <bundle> [-k] [-u 100]`. Las apps de serie se instalan para el usuario 100 | Documentación de `bm` (OpenHarmony) |
| ¿Se pueden quitar las de serie sin root? | **No lo confirma ninguna fuente.** Hay un error 9568380, «uninstall system app error», para las que no se dejan | Documentación de `bm` |
| ¿Se pueden desactivar? | **No en un móvil normal**: `bm disable` y `bm enable` «solo en la versión root, no en la de usuario» | Documentación de `bm` |
| ¿Se puede volver a poner una app de serie quitada? | **No hay comando para eso.** No existe un equivalente de `install-existing` ni de `recover` en `bm`. Solo queda la tienda (AppGallery) si la app está allí, o restablecer el móvil de fábrica | Documentación de `bm` |
| ¿Se puede hacer desde el navegador? | **Hoy no.** No existe `hdc` sobre WebUSB. Hay un cliente en JavaScript (`hdc-js`, MIT, 1 estrella, una semana de vida) que solo habla con un servidor `hdc` por TCP, no hace la autenticación del móvil (RSA-3072) y no se ha probado con un móvil real | github.com/w1663/hdc-js |
| ¿Hay lista de apps? | No: UAD-ng solo cubre Android. Habría que crear una lista de bundles de HarmonyOS NEXT desde cero | — |
| ¿Quién lo usa? | Sobre todo en China (Mate 70, Pura 70…). Los Huawei que se venden en España siguen con EMUI | COMPATIBILIDAD.md |

## Choque con las reglas de Poda

AGENTS.md exige **vuelta atrás** y **que la seguridad del móvil vaya primero**. Con lo que sabemos:

1. Quitar una app de serie en HarmonyOS NEXT podría **no tener vuelta atrás** salvo por la tienda o restableciendo el móvil.
2. No hay «desactivar», que en Android es la opción segura de reserva.
3. No hay lista de apps conocidas ni de protegidas: el primer usuario haría de conejillo de indias. En Android así se rompió un Redmi Note 4 (ver `protecciones.ts`).

Por eso no se propone construir ya «quitar» en HarmonyOS NEXT, sino ir por fases que solo avanzan si la anterior confirma que es seguro.

## Fases propuestas

| Fase | Qué es | Vía | Requisito para empezar |
|---|---|---|---|
| A | Guía honesta: qué se puede quitar a mano desde el propio móvil (mantener pulsado → Desinstalar) y cómo recuperarlo desde AppGallery. Poda la enseña cuando detecta HarmonyOS NEXT o en una página propia | Web | Ninguno |
| B | Solo lectura: listar las apps de un HarmonyOS NEXT con `hdc` (`bm dump -a`) para crear la lista de bundles con ayuda de la comunidad (plantilla de issue «probado») | MCP y línea de comandos, con `hdc` instalado | Un móvil para probar |
| C | Quitar, solo apps verificadas como quitables **y** recuperables (por la tienda), con copia y confirmación como en Android | MCP y línea de comandos | Fase B hecha y vuelta atrás comprobada en un móvil real |
| D | Lo mismo desde el navegador: `hdc` sobre WebUSB | Web | Fase C funcionando y la autenticación de `hdc` resuelta (trabajo grande) |

## Requisitos (fase A, la única que se puede especificar hoy)

- **R-001** Quien tiene un HarmonyOS NEXT encuentra en Poda una explicación clara de qué puede hacer y qué no.
  - CA-1: Dado alguien que busca su caso en la web, cuando abre la guía de HarmonyOS NEXT, entonces ve los pasos para quitar apps desde el propio móvil y cómo recuperarlas.
  - CA-2: La guía no promete nada que Poda no haga: dice que Poda todavía no conecta con HarmonyOS NEXT.
  - CA-3: La guía existe en los cinco idiomas.
- **R-002** Quien intenta conectar un HarmonyOS NEXT en /conectar encuentra el camino a la guía.
  - CA-1: Dado alguien en la pantalla inicial de /conectar, entonces ve una nota: si su Huawei tiene HarmonyOS 5 o superior, no aparecerá en la lista, con un enlace a la guía.
  - CA-2: Dado un error al conectar, entonces la misma nota aparece junto al consejo.
  - (Reconocer un HarmonyOS NEXT por USB queda fuera: sin un móvil no se puede saber qué identificador expone.)

- **R-003** La documentación deja de decir solo «no compatible» y enlaza la guía.
  - CA-1: COMPATIBILIDAD.md, README.md, README.en.md y PROMPT.md enlazan la guía donde hablan de HarmonyOS NEXT, y siguen diciendo que Poda no se conecta a él.

## Fuera de alcance (por ahora)

- Quitar apps de HarmonyOS NEXT desde Poda (fases C y D).
- HarmonyOS 4 o anterior y EMUI: ya son Android y ya funcionan.
- Root o desbloqueo del cargador.

## Dudas

- Resuelto: no hay móvil para probar → solo la fase A.
- Resuelto: en el futuro, Poda solo quitará en HarmonyOS NEXT apps que se puedan recuperar (desde AppGallery), comprobado en un móvil real. La regla de vuelta atrás de AGENTS.md no cambia.
- Resuelto: la guía va en los cinco idiomas actuales; no se añade el chino.

## Fuentes

- Huawei, «Uninstall pre-installed apps»: mantener pulsado → Desinstalar, o Ajustes → Aplicaciones → Aplicaciones. Las del sistema y algunas importantes (Mensajes, Cámara) no se pueden quitar. No dice versión ni cómo recuperarlas. https://consumer.huawei.com/en/support/content/en-us00740805/
- OpenHarmony, herramienta `bm`: subcomandos, usuario 100, `enable`/`disable` solo en versión root, sin comando para restaurar. https://gitcode.com/openharmony/docs/blob/master/en/application-dev/tools/bm-tool.md
- `hdc-js`: https://github.com/w1663/hdc-js

## Verificación (fase A)

| Requisito | Cómo se comprobó |
|---|---|
| R-001 | Pruebas «003 R-001» de `apps/web/test/textos.test.mjs` (fallaban antes). `pnpm build` genera `/harmonyos-next/` en los cinco idiomas y la añade al sitemap |
| R-002 | Prueba «003 R-002»: los cinco idiomas enlazan la guía. La nota se pinta en las pantallas de inicio y de error de `Conectar.tsx`. Vista en el navegador en la pantalla de error (local, 15 de noviembre de 2026) |
| R-003 | Revisión: README.md, README.en.md, COMPATIBILIDAD.md y PROMPT.md enlazan la guía y siguen diciendo que Poda no se conecta |

Nada de la guía se ha comprobado en un HarmonyOS NEXT real: se basa en la página de soporte de Huawei, que no indica versión.
