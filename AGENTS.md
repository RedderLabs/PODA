# AGENTS.md

Instrucciones para asistentes de IA (Claude, Codex, Gemini, Copilot…) que trabajan en este repositorio.

## Dos tareas distintas

1. **Limpiar el móvil de alguien** con Poda → sigue [PROMPT.md](PROMPT.md) al pie de la letra. No improvises comandos `adb` a mano.
2. **Cambiar el código de Poda** → sigue este archivo.

## El proyecto en una frase

PODA (Programa para Ocultar y Desactivar Apps) quita las apps de serie de un Android para el usuario 0, sin root y con vuelta atrás, desde una web (WebUSB), un servidor MCP o la línea de comandos. Las tres vías comparten `@poda/nucleo`.

## Reglas que no se rompen

- **La seguridad del móvil va primero.** Nunca relajes `packages/nucleo/src/protecciones.ts` sin una razón concreta y documentada en el PR. Ante la duda, un paquete va a `PROTEGIDOS` o a `AVISO_PODA`, no al revés.
- **Nada cambia sin copia y sin confirmación.** No elimines la copia previa, la confirmación explícita, el rechazo de paquetes `bloqueado` ni la validación de nombres (`esPaqueteValido`). Los nombres de paquete van a una línea de shell en el móvil: sin validar serían inyección de comandos.
- **Restaurar nunca quita nada.** `pasosParaRestaurar` solo reinstala o reactiva.
- **Una sola fuente de verdad.** Las reglas viven en `packages/nucleo`. La web y el MCP no duplican niveles, perfiles ni protecciones.
- **Nada sale del ordenador del usuario.** Ni la lista de apps de su móvil ni sus propiedades. Sin analíticas que la envíen, sin servidores.
- **Honestidad en los textos.** No prometas en la web o en los README nada que el código no haga.

## Estilo

- Textos para el usuario en **español de España**, claros y sin jerga. Identificadores y comentarios también en español, como el resto del código.
- TypeScript estricto. Componentes pequeños. CSS en `apps/web/app/globals.css` con las variables existentes.
- La web es **estática** (`output: "export"`): nada de rutas de servidor dinámicas ni APIs.

## Antes de dar algo por terminado

```bash
pnpm build && pnpm test && pnpm typecheck
```

Prueba la web en el modo de ejemplo: `pnpm dev` y abre `http://localhost:3000/conectar/?demo` (quitar, reiniciar y restaurar). Si tocas las protecciones o los perfiles, añade una prueba en `packages/nucleo/test/nucleo.test.mjs`.

## Mapa

Ver [docs/desarrollo.md](docs/desarrollo.md).
