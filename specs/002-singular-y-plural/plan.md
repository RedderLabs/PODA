# Plan: singular y plural en los textos de la web

## Enfoque

- `formatear(texto, datos, idioma)` en `packages/nucleo/src/idiomas.ts`. Sustituye `{clave}` y `{clave|uno|varios}`; la forma la elige `Intl.PluralRules(idioma)`. La categoría `one` usa la primera forma y cualquier otra (`other`, `many`…) la segunda. Va en el núcleo porque ahí viven los idiomas y tiene pruebas. El MCP podrá usarlo si algún día lo necesita.
- `fmt` de `apps/web/lib/rutas.ts` pasa a pedir el idioma y llama a `formatear`. TypeScript señala cada llamada que falte por cambiar.
- En `apps/web/textos/*.ts`, cada texto con cantidad marca sus formas, por ejemplo: `"**{n}** {n|app de serie|apps de serie} que puedes quitar sin riesgo"`.
- Prueba nueva en `apps/web/test/textos.test.mjs` (`node --experimental-strip-types`, sin dependencias): los textos con formas en español las tienen en todos los idiomas, y ninguno deja una cifra pegada a «apps» o «intentos» sin formas.

## Cómo se cubre cada requisito

| Requisito | Solución | Prueba |
|---|---|---|
| R-001 | Textos con formas + `Intl.PluralRules` | `nucleo.test.mjs` «002 R-001» (reglas de cada idioma) y `apps/web/test/textos.test.mjs` «002 R-001» (textos reales) |
| R-002 | `formatear` | `nucleo.test.mjs` «002 R-002 CA-1…CA-3» |
| R-003 | Prueba de coherencia de los textos | `apps/web/test/textos.test.mjs` «002 R-003» y «002 R-001» |

## Riesgos y decisiones

- La web estrena una prueba propia (`pnpm test` la recoge con Turborepo).
- Algunas frases se reordenan al traducir para que concuerden («ya quitadas» → «ya quitada»).
