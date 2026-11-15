# Aplicar y restaurar con las mismas reglas en todas las vías

Estado: borrador (R-001 implementada el 15 de noviembre de 2026; R-002 a R-004 pendientes de aprobar)

## Problema

AGENTS.md exige una sola fuente de verdad: la web, el MCP y la línea de comandos deben tratar igual el móvil. Hoy el MCP (y con él la línea de comandos y la vía del asistente de IA) tiene su propia lógica para aplicar y restaurar, y se separa del núcleo en dos puntos:

1. **Puede quitar un paquete protegido.** Si el asistente pide un paquete que no está en la lista de UAD-ng y activa «incluir fuera de lista», el MCP lo trata como «desconocido» y lo quita sin mirar si Poda lo protege. Hay 8 paquetes protegidos fuera de la lista de UAD-ng, entre ellos `com.android.networkstack` (sin él no hay datos ni Wi‑Fi), `com.android.ims` (llamadas por 4G) y `org.lineageos.setupwizard`. Las familias por patrón tampoco se comprueban.
2. **Restaurar desde una copia no hace lo mismo que en la web.** Si en la copia una app estaba desactivada y ahora está quitada, la web la vuelve a poner y el MCP la deja quitada.

## Fuera de alcance

- Cambiar qué paquetes están protegidos o en qué nivel (eso es `protecciones.ts`).
- Cambiar la web: ya usa el núcleo.
- Volver a desactivar al restaurar: restaurar nunca quita ni desactiva nada.
- Cambiar el formato de la copia (sigue siendo `CopiaEstado` versión 1).

## Comportamiento actual (MCP y línea de comandos)

- `aplicar` rechaza nombres no válidos, paquetes que no están en el móvil, ya quitados (o ya desactivados al desactivar), fuera de lista salvo que se pida, y de nivel `bloqueado`. Sin `confirmar` solo simula. Con `confirmar` exige una copia de las últimas 24 h. Si no puede quitar, prueba a desactivar.
- `restaurar` con copia solo vuelve a poner las apps que en la copia estaban `instalado`. Con paquetes sueltos los reinstala o reactiva.
- Las copias se leen sin validar el formato.

## Requisitos

- **R-001** Ninguna vía quita ni desactiva un paquete protegido, esté o no en la lista de UAD-ng. *(implementada; pruebas «R-001» en `apps/mcp/test/prueba.mjs`)*
  - CA-1: Dado un paquete protegido que no está en la lista (`com.android.networkstack`), cuando se pide aplicarlo con «incluir fuera de lista», entonces se rechaza con el motivo «protegido» y no se envía ningún comando al móvil.
  - CA-2: Dado un paquete que encaja con una familia protegida por patrón y no está en la lista, cuando se pide aplicarlo con «incluir fuera de lista», entonces se rechaza igual que en CA-1.
  - CA-3: Dado un paquete fuera de la lista y no protegido, cuando se pide con «incluir fuera de lista», entonces se acepta como hoy (nivel «desconocido»).
  - CA-4: La simulación (sin confirmar) muestra los mismos rechazos que la ejecución real.

- **R-002** Restaurar desde una copia hace lo mismo en el MCP que en la web: lo que diga `pasosParaRestaurar` del núcleo.
  - CA-1: Dada una copia con una app `desactivado` que ahora está `quitado`, cuando se restaura la copia, entonces se vuelve a poner.
  - CA-2: Dada una copia con una app `instalado` que ahora está `desactivado`, cuando se restaura, entonces se reactiva.
  - CA-3: Dada una copia con una app `quitado` que ahora está `instalado`, cuando se restaura, entonces no se toca.
  - CA-4: Dada una app que en la copia está `instalado` y ya lo está, cuando se restaura, entonces cuenta como «sin cambios».
  - CA-5: Restaurar con paquetes sueltos sigue funcionando como hoy (reinstala o reactiva; nunca quita).

- **R-003** El MCP lee y escribe las copias con las funciones del núcleo.
  - CA-1: Una copia hecha por la web se puede restaurar con el MCP y al revés.
  - CA-2: Dado un archivo que no es una copia de Poda o con un estado desconocido, cuando se restaura, entonces se rechaza con un mensaje claro y no se envía ningún comando.

- **R-004** El MCP decide si una respuesta del móvil es un éxito con `RESPUESTA_OK` del núcleo.
  - CA-1: Las respuestas que la web da por buenas, el MCP también, y viceversa, para quitar, desactivar, reinstalar y activar.

## Requisitos no funcionales

- Sin dependencias nuevas.
- Las pruebas del MCP siguen funcionando con el adb falso (`apps/mcp/test/adb-falso.mjs`), sin móvil.

## Dudas

- Resuelto: R-001 rechaza los protegidos siempre, aunque el usuario insista (pedido por el usuario como corrección de seguridad).
- [POR ACLARAR: R-002 CA-1 cambia el comportamiento del MCP (ahora repone más apps al restaurar una copia). ¿De acuerdo? Se propone que sí, por coherencia con la web.]
