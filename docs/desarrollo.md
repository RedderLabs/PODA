# Desarrollo

Monorepo con [Turborepo](https://turbo.build) y [pnpm](https://pnpm.io). Necesitas Node 20 o superior y pnpm (`npm install -g pnpm`).

```bash
git clone https://github.com/RedderLabs/PODA.git
cd PODA
pnpm install
pnpm dev          # web en http://localhost:3000 (WebUSB funciona en localhost)
```

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Web en modo desarrollo |
| `pnpm build` | Compila todo: núcleo, MCP y web (la web queda estática en `apps/web/out/`) |
| `pnpm test` | Pruebas del núcleo y del MCP |
| `pnpm typecheck` | Comprueba los tipos en todo el monorepo |
| `pnpm resumen` | Regenera `data/resumen.json` (recuento por fabricante y nivel) |

Sin móvil: `http://localhost:3000/conectar/?demo` usa un móvil de ejemplo que responde como uno real (quita, desactiva, restaura y reinicia).

En **Windows**, antes de conectar por la web, cierra cualquier adb abierto (`adb kill-server`): solo un programa puede usar el USB del móvil a la vez.

## Estructura

```
apps/
  web/        Next.js 15, exportación estática: portada, /conectar (WebUSB), /marcas, /sin-pc, /rescate
  mcp/        servidor MCP y línea de comandos `poda` (usa adb)
packages/
  nucleo/     reglas comunes: niveles, perfiles, protecciones, ficha del móvil, recuento, operaciones y copias
data/
  uad_lists.json    lista de apps (de UAD-ng, GPL-3.0)
  fabricantes.json  prefijos de paquete por fabricante
  resumen.json      recuento por fabricante y nivel (generado)
docs/               guías (restaurar, rescate, problemas, sin ordenador…) e imágenes del README
PROMPT.md           prompt para Claude e instrucciones que sigue el asistente
COMPATIBILIDAD.md   requisitos, fabricantes, avisos por marca y Apple
```

Las tres vías (web, MCP y prompt) usan `@poda/nucleo`, así que se comportan igual: mismos niveles, mismos perfiles y la misma protección para no tocar nunca lo imprescindible. La web usa el núcleo desde su código fuente (`next.config.ts`), así que `pnpm dev` siempre ve los últimos cambios.

### Piezas clave

| Archivo | Qué hace |
|---|---|
| `packages/nucleo/src/protecciones.ts` | Correcciones de Poda sobre UAD-ng: lo que nunca se toca y lo que va a experto con aviso |
| `packages/nucleo/src/operaciones.ts` | Estado de las apps, plan de cada perfil, comandos validados, copias y restauración |
| `packages/nucleo/src/ficha.ts` | Reconoce el móvil (marca, modelo, capa, ROM personalizada) y genera los avisos |
| `apps/web/lib/conexion.ts` | Conexión WebUSB (Tango) y el móvil de ejemplo |
| `apps/web/components/Podar.tsx` | Elegir perfil, copia, aplicar, reiniciar y restaurar |
| `apps/mcp/src/logica.ts` | Lo mismo para el MCP y la línea de comandos |

## Publicar la web

`pnpm build` deja `apps/web/out/` con HTML estático, imágenes para compartir y `lista.json`, `detalles.json` y `protegidas.json`. Sirve en cualquier alojamiento con **HTTPS** (WebUSB lo exige): Coolify, Caddy, Nginx, Cloudflare Pages…

La dirección del sitio para el sitemap, las canónicas y las imágenes se toma de `NEXT_PUBLIC_URL_BASE` (por defecto `https://podamovil.com`).

Cabeceras recomendadas:

```
Permissions-Policy: usb=(self)
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Actualizar la lista de apps

```bash
curl -L -o data/uad_lists.json \
  https://raw.githubusercontent.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation/main/resources/assets/uad_lists.json
pnpm build && pnpm resumen
```

Revisa después la tabla de [COMPATIBILIDAD.md](../COMPATIBILIDAD.md) y pasa las pruebas (`pnpm test`).
