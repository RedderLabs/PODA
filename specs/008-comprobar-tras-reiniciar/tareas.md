# Tareas: comprobar el móvil después del reinicio

- [x] T1 Pruebas que fallan: «008 R-002», «008 R-003», «008 R-005» (`packages/nucleo/test/nucleo.test.mjs`).
- [x] T2 `packages/nucleo/src/comprobar.ts`: `COMANDOS_COMPROBAR`, `comprobarTrasReinicio`, `todoEnOrden`.
- [x] T3 `leerEstados` pasa a `apps/web/lib/conexion.ts` (lo usan `Podar` y `Conectar`).
- [x] T4 `Podar` pasa a `reiniciar` cómo dejó cada app (`comoQuedaron`); `Conectar` guarda el estado antes de reiniciar y comprueba al volver. Se usa el resultado de `esperarArranque` (R-001).
- [x] T5 `components/TrasReinicio.tsx` y estilos `.tras-reinicio`.
- [x] T6 Textos en los cinco idiomas; se quita `arranco` («arrancó bien» sin comprobar nada). Prueba «008 R-006».
- [x] T7 Modo de ejemplo: responde a la pantalla de inicio y al teclado, y `com.facebook.appmanager` vuelve sola al reiniciar (R-007).
- [x] T8 Revisión en `/conectar/?demo` con un navegador sin ventana: quitar 22 apps con el PIN 1234, reiniciar y ver la comprobación con la app que volvió.
