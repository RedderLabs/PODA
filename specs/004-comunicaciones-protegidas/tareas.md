# Tareas: llamadas, mensajes, contactos y ubicación protegidos

- [x] T1 (R-001, R-002, R-003) Pruebas en `nucleo.test.mjs`. Hecho cuando: fallan con las listas actuales.
- [x] T2 (R-001, R-002) Grupos nuevos en `PROTEGIDOS` y su traducción. Hecho cuando: pasan las pruebas «004 R-001» y «004 R-002» y la de idiomas.
- [x] T3 (R-003) Relojes en `AVISO_PODA`; fuera los que pasan a protegidos; traducciones. Hecho cuando: pasan «004 R-003» y la de idiomas.
- [x] T4 (R-004) README, README.en, `pnpm resumen` y tablas de recuento.
- [x] T5 Verificar requisito a requisito y marcar como implementada.
- [x] T6 (R-005) Componente `GruposProtegidos` compartido entre «Sin ordenador» y `/conectar/`; textos `conectar.protegidasTitulo` y `protegidasTexto` en los cinco idiomas.

## Verificación (15 de noviembre de 2026)

- R-001 CA-1, R-002 CA-1, R-003 CA-1: pruebas «004 …» en `packages/nucleo/test/nucleo.test.mjs` (fallaban antes del cambio, pasan después).
- R-001 CA-2: el MCP rechaza lo protegido antes que nada (prueba de la especificación 001 en `apps/mcp/test/prueba.mjs`).
- R-001 CA-3: `pasosParaRestaurar` no mira las protecciones; sin cambios.
- R-004 CA-1: `/sin-pc/` muestra los dos grupos nuevos en los cinco idiomas (revisado en `apps/web/out`).
- R-004 CA-2: README y README.en corregidos; tablas de recuento regeneradas con `pnpm resumen`.
- `pnpm build && pnpm test && pnpm typecheck`: núcleo 37, web 8, MCP 26 y CLI.
- R-005: prueba «004 R-005» en `apps/web/test/textos.test.mjs` y revisión en `/conectar/`.
