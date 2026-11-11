# Contribuir a Poda

Gracias por querer ayudar. Poda toca el móvil de gente que no es técnica, así que lo más valioso no es código nuevo, sino **saber qué pasa en móviles reales**.

## Lo que más ayuda

### 1. Contar cómo te fue

Abre una issue con la plantilla **«Probado en mi móvil»**: marca, modelo, versión de Android y capa, perfil que usaste, qué se quitó y si todo siguió funcionando después de reiniciar. Los fallos son igual de útiles que los éxitos.

### 2. Avisar de una app mal clasificada

¿Poda propone quitar algo que rompió una función? ¿O deja fuera algo que claramente sobra? Usa la plantilla **«App mal clasificada»** con el nombre del paquete (`com.ejemplo.app`), tu móvil y qué pasó.

- Si es algo que **no debería tocarse nunca**, va a `PROTEGIDOS` en [`packages/nucleo/src/protecciones.ts`](packages/nucleo/src/protecciones.ts).
- Si se puede quitar pero la gente lo usa a diario, va a `AVISO_PODA`, con un aviso en español.
- Si es un error de la lista de partida, avisa también a [UAD-ng](https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation): así se corrige para todos.

### 3. Traducir descripciones

Muchas apps tienen la descripción solo en inglés. Las traducciones claras y cortas al español son muy bienvenidas.

## Si vas a mandar código

1. Abre antes una issue o una discusión si el cambio es grande.
2. Haz el cambio en una rama y comprueba:

   ```bash
   pnpm build && pnpm test && pnpm typecheck
   ```

3. Prueba el flujo completo en el modo de ejemplo (`/conectar/?demo`) y, si puedes, en un móvil real.
4. En el PR, explica qué cambia para el usuario y cómo lo has probado.

Reglas del proyecto (seguridad, una sola fuente de verdad, textos honestos): [AGENTS.md](AGENTS.md). Cómo está organizado el código: [docs/desarrollo.md](docs/desarrollo.md).

## Licencia

Al contribuir aceptas que tu aportación se publique bajo la [GPL‑3.0 o posterior](LICENSE), como el resto del proyecto.

## Convivencia

Este proyecto sigue el [Código de conducta](CODE_OF_CONDUCT.md).
