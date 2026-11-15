# Especificaciones

Poda se desarrolla guiado por especificaciones: **especificación → plan → tareas → pruebas y código → verificación**.

```
specs/
├── producto.md        propósito, usuarios, alcance y requisitos no funcionales
├── arquitectura.md    piezas, datos y decisiones (enlaza docs/desarrollo.md, no lo repite)
└── NNN-nombre/
    ├── spec.md        qué y por qué, sin tecnología. Requisitos R-NNN con criterios CA-N
    ├── plan.md        cómo se resuelve y qué prueba cubre cada requisito
    └── tareas.md      pasos pequeños; cada uno cita su requisito
```

## Cómo se trabaja

- **Funcionalidad nueva o cambio importante:** carpeta nueva con `spec.md`, `plan.md` y `tareas.md`. No se programa hasta que `spec.md` está `aprobada`.
- **Cambio pequeño de comportamiento:** se añade el criterio a la especificación que ya existe, en el mismo commit que el código.
- **Error:** primero una prueba que lo reproduce. Si la especificación no lo contemplaba, se corrige.
- **Refactor:** nada nuevo; las pruebas hacen de red. Si no las hay, se añaden antes.
- Las pruebas llevan el identificador en el nombre (`R-002 CA-1: …`) para poder seguir cada requisito hasta su prueba.
- Las reglas permanentes del proyecto están en [AGENTS.md](../AGENTS.md). Las especificaciones no las copian: las citan.
- No se especifica todo Poda de golpe. Solo lo que se va a tocar, describiendo antes el comportamiento actual.

Estados de una especificación: `borrador` → `aprobada` → `implementada` (o `sustituida por NNN`).

## Índice

| Nº | Especificación | Estado |
|---|---|---|
| 001 | [Aplicar y restaurar con las mismas reglas en todas las vías](001-mismas-reglas-en-todas-las-vias/spec.md) | implementada |
| 002 | [Singular y plural en los textos de la web](002-singular-y-plural/spec.md) | implementada |
| 003 | [Apps de serie en HarmonyOS NEXT](003-harmonyos-next/spec.md) | fase A implementada |
