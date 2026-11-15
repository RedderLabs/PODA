# Tareas: aplicar y restaurar con las mismas reglas en todas las vías

- [x] T1 (R-001) Prueba que reproduce el fallo y `estaProtegido` en `aplicar`. Hecho cuando: la prueba «R-001» pasa y antes fallaba.
- [x] T2 (—) La prueba del MCP corre en Windows (adb falso `.mjs` lanzado con Node). Hecho cuando: `pnpm --filter @poda/mcp test` pasa en Windows.
- [x] T3 (R-003) `copias.ts` usa `crearCopiaEstado` y `leerCopiaEstado`. Hecho cuando: las pruebas «R-003» pasan.
- [x] T4 (R-002, depende de T3) `restaurar` con copia usa `pasosParaRestaurar`. Hecho cuando: las pruebas «R-002» pasan.
- [x] T5 (R-004) `aplicar` y `restaurar` usan `RESPUESTA_OK`. Hecho cuando: todo el flujo del MCP sigue pasando.
- [x] T6 Verificar requisito a requisito y marcar la especificación como `implementada`.
