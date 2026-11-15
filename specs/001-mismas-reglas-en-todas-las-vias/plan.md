# Plan: aplicar y restaurar con las mismas reglas en todas las vías

## Enfoque

El MCP deja de tener su propia versión de las reglas y llama al núcleo. Solo se toca `apps/mcp/src/`: la web ya usa el núcleo.

| Pieza del MCP | Pasa a usar |
|---|---|
| `aplicar`: rechazos | `estaProtegido` antes que cualquier otra comprobación |
| `aplicar` y `restaurar`: ¿ha ido bien? | `RESPUESTA_OK` |
| `restaurar` con copia: qué se hace | `pasosParaRestaurar` |
| `copias.ts`: formato | `CopiaEstado`, `crearCopiaEstado`, `leerCopiaEstado` |
| `adb.ts`: tipo de estado | `EstadoPaquete` del núcleo |

`restaurar` con paquetes sueltos sigue igual: reinstala lo quitado y reactiva lo desactivado. Se suma a los pasos de la copia si se indican las dos cosas.

## Datos

Sin cambios de formato: la copia sigue siendo `CopiaEstado` versión 1, así que las copias que ya existen siguen valiendo.

## Contrato

La salida de `restaurar` no cambia: `{ serie, hechos, fallidos, sin_cambios }`. Con copia, `sin_cambios` cuenta las apps de la copia que siguen en el móvil y no necesitan nada.

## Cómo se cubre cada requisito

| Requisito | Solución | Prueba (`apps/mcp/test/prueba.mjs`) |
|---|---|---|
| R-001 | `estaProtegido` en `aplicar` | «R-001 CA-1…CA-4» |
| R-002 | `pasosParaRestaurar` en `restaurar` | «R-002 CA-1…CA-5» |
| R-003 | `crearCopiaEstado` y `leerCopiaEstado` en `copias.ts` | «R-003 CA-1», «R-003 CA-2» |
| R-004 | `RESPUESTA_OK` en `aplicar` y `restaurar` | Cubierto por todo el flujo con el adb falso, que responde como un móvil real |

## Riesgos y decisiones

- R-002 hace que el MCP reponga más apps al restaurar una copia (las que estaban desactivadas y ahora están quitadas). Es lo que ya hace la web. `(por defecto)`
- Un paquete de la copia que el móvil ya no conoce se ignora, como en la web. Antes el MCP lo daba como fallido.
