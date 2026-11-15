# Comprobar el móvil después del reinicio

Estado: implementada (pedida por el usuario el 15 de noviembre de 2026).

## Problema

Después de quitar apps (o de restaurarlas), Poda pide reiniciar el móvil. Cuando vuelve, la web solo dice «El móvil ha arrancado bien después de la limpieza», y lo dice aunque Android no haya terminado de arrancar en 4 minutos (`esperarArranque` devuelve `false` y nadie lo mira). No comprueba nada más: ni que el móvil siga teniendo lo imprescindible, ni que las apps quitadas sigan quitadas. Algunos fabricantes reinstalan apps al arrancar, y el usuario no se entera.

El usuario pide: «después del reinicio obligatorio hay que ver si el móvil está bien y si se han eliminado las apps que se marcaron».

## Requisitos

- **R-001** Al volver del reinicio, Poda dice si Android terminó de arrancar. Si no terminó en 4 minutos, no dice que arrancó bien: avisa y enlaza a [rescate](/rescate/).
- **R-002** Poda comprueba lo que puede comprobar desde el ordenador y dice el resultado de cada cosa:
  - CA-1: Hay pantalla de inicio (`cmd package resolve-activity` de `HOME` da una app instalada).
  - CA-2: Hay teclado (`settings get secure default_input_method` da una app instalada).
  - CA-3: Ninguna app protegida (`estaProtegido`) que estaba instalada antes de reiniciar ha dejado de estarlo.
  - CA-4: Si el móvil no admite una comprobación, se dice «no se ha podido comprobar», nunca «bien».
- **R-003** Poda comprueba cada app que cambió antes de reiniciar:
  - CA-1: Las quitadas siguen quitadas y las desactivadas siguen desactivadas (o quitadas).
  - CA-2: Después de restaurar, las reinstaladas o reactivadas siguen en el móvil (no se han vuelto a quitar). Pueden estar desactivadas si así estaban en la copia.
  - CA-3: Las que no están como se dejaron salen en una lista, con lo que se esperaba y lo que hay. Si volvieron solas, se explica que algunos fabricantes las reinstalan al arrancar y se ofrece volver a elegir apps (con su copia y su confirmación, como siempre: esta pantalla no cambia nada).
- **R-004** Si todo está bien, un resumen corto: «Todo en orden: X de X apps siguen quitadas».
- **R-005** Las comprobaciones solo leen el móvil. La regla vive en `@poda/nucleo` (`comprobarTrasReinicio`), con los comandos en `COMANDOS_COMPROBAR`.
- **R-006** Textos en los cinco idiomas. Se sigue diciendo que pruebe una llamada: Poda no puede comprobar que las llamadas funcionan.
- **R-007** En el modo de ejemplo se puede ver una app que vuelve sola (`com.facebook.appmanager`, como hacen algunos móviles al arrancar).

## Fuera de alcance

- El MCP y la línea de comandos no reinician el móvil; el asistente ya vuelve a leer el estado tras reiniciar.
- Volver a quitar automáticamente las que vuelvan: siempre pasa por elegir, copia y confirmación.

## Pruebas

- R-002 a R-005: «008 R-002», «008 R-003» en `packages/nucleo/test/nucleo.test.mjs`.
- R-006: «008 R-006» en `apps/web/test/textos.test.mjs`.
- Revisión en `/conectar/?demo`: quitar apps (incluida `com.facebook.appmanager`), reiniciar y ver la comprobación con una app que volvió.
