# Antes y después: comparar con la copia

Estado: implementada (pedida por el usuario el 15 de noviembre de 2026).

## Problema

Al terminar de quitar apps, Poda enseña la lista de resultados de cada comando («quitada», «desactivada»). Es lo que Poda cree haber hecho, no una prueba. El usuario pide: «cuando se han eliminado las apps desde cualquiera de los perfiles se debería comparar las apps que se eliminaron con la copia y ver la comparativa, por si los usuarios no se creen que se hayan eliminado».

Poda ya guarda una copia del estado de todas las apps antes de tocar nada, y vuelve a leer el móvil al acabar. Falta enseñar una cosa frente a la otra.

## Requisitos

- **R-001** Al acabar de quitar o desactivar (con cualquier perfil), Poda enseña «Antes y después»: la copia guardada antes de empezar frente a lo que acaba de leer del móvil.
  - CA-1: Un resumen con cuántas apps había instaladas, desactivadas y quitadas en la copia y cuántas hay ahora.
  - CA-2: La lista de las apps que han cambiado, con su estado en la copia y el de ahora.
  - CA-3: El «ahora» se lee del móvil (`pm list packages`), no sale de las respuestas de los comandos. El texto lo dice.
  - CA-4: Se dice cómo comprobarlo en el propio móvil (Ajustes › Aplicaciones).
- **R-002** Después del reinicio, la comprobación (specs/008) también enseña «Antes y después» con la misma copia, leída del móvil ya reiniciado.
- **R-003** Después de restaurar se enseña lo mismo; lo esperado es que no quede ninguna diferencia.
- **R-004** La comparación vive en `@poda/nucleo` (`compararConCopia`) y solo lee.
- **R-005** Textos en los cinco idiomas.

## Fuera de alcance

- Descargar la comparación como archivo: la copia ya se descarga y el móvil se puede revisar a mano.

## Pruebas

- R-001 y R-004: «009 R-001» en `packages/nucleo/test/nucleo.test.mjs`.
- R-005: «009 R-005» en `apps/web/test/textos.test.mjs`.
- Revisión en `/conectar/?demo`: quitar, ver «Antes y después», reiniciar y verlo otra vez.
