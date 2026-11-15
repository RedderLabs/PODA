# Plan: apps de serie en HarmonyOS NEXT (fase A)

## Enfoque

Una página estática nueva, `/harmonyos-next/`, hecha igual que `/sin-pc/`:

- `apps/web/paginas/HarmonyNext.tsx`, llamada desde `app/(es)/harmonyos-next/` y `app/[idioma]/harmonyos-next/`.
- Textos en una sección `harmonyNext` de `apps/web/textos/*.ts`, en los cinco idiomas.
- Se añade al sitemap. No va en el menú principal: es un caso minoritario. Se llega desde /conectar y desde la documentación.
- En `/conectar`, una nota con enlace (`conectar.harmonyNext`) en la pantalla inicial y en la de error.

Contenido de la guía, sin prometer nada que no esté confirmado:

1. Antes de quitar nada, comprobar que la app está en AppGallery, porque es la única forma de recuperarla.
2. Mantener pulsado el icono → **Desinstalar**. Si solo sale quitar del escritorio, solo desaparece el icono.
3. Si no sale, ir a Ajustes → Aplicaciones → Aplicaciones → **Desinstalar**. Si tampoco sale, el sistema la protege.
4. Para recuperarla: buscarla en AppGallery. Sus datos no vuelven.

Después, qué conviene no quitar (llamadas, mensajes, contactos, cámara, galería, reloj, AppGallery, servicios de Huawei), por qué Poda no se conecta y un aviso contra los comandos de Android que circulan por internet.

## Cómo se cubre cada requisito

| Requisito | Solución | Prueba |
|---|---|---|
| R-001 | Página `/harmonyos-next/` en cinco idiomas | `apps/web/test/textos.test.mjs` «003 R-001» (misma estructura en los cinco idiomas, dice que Poda no se conecta); `pnpm build` genera las cinco páginas |
| R-002 | Nota `conectar.harmonyNext` en inicio y error | `textos.test.mjs` «003 R-002» (todos los idiomas enlazan `/harmonyos-next/`); revisión del componente |
| R-003 | Enlaces en la documentación | Revisión manual |

## Riesgos y decisiones

- Los nombres de los menús de HarmonyOS NEXT pueden variar según la versión: la guía lo dice.
- Sin un móvil no se ha comprobado nada en un HarmonyOS NEXT real. La guía se basa en la página de soporte de Huawei, que no indica versión.
