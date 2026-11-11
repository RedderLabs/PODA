# Sin ordenador (Android 11 o superior)

Desde Android 11, el móvil puede conectarse a sí mismo por **depuración inalámbrica**, como si fuera el ordenador. Con dos apps gratuitas y de código abierto se pueden quitar las apps de serie sin cable, sin PC y sin root:

- [Shizuku](https://github.com/RikkaApps/Shizuku): hace de «ordenador» dentro del propio móvil.
- [Canta](https://github.com/samolego/Canta): la app que quita las apps. Usa la misma lista de partida que Poda (UAD-ng).

Poda no es ninguna de esas apps ni está relacionada con ellas. Lo que aporta aquí es **su lista de lo que no se debe quitar**.

La guía paso a paso está en **[podamovil.com/sin-pc](https://podamovil.com/sin-pc/)**. La lista, en formato abierto para cualquier herramienta: **[podamovil.com/protegidas.json](https://podamovil.com/protegidas.json)** (se genera desde [`packages/nucleo/src/protecciones.ts`](../packages/nucleo/src/protecciones.ts)).

En Android 10 o anterior no hay depuración inalámbrica: usa Poda con cable.
