# Qué parte de cada origen quita cada perfil

Estado: implementada (pedida por el usuario el 15 de noviembre de 2026).

## Problema

En «Elige perfil» cada app lleva su origen (Android base, fabricante, Google, operadora, terceros). El usuario quiere saber, de un vistazo, qué parte de cada origen se puede quitar sin que pase nada. El origen no lo dice por sí solo: en todos hay apps seguras y apps que Poda no toca nunca.

## Requisitos

- **R-001** La pantalla de elegir perfil muestra, para cada origen presente en el móvil conectado, qué parte de sus apps conocidas quita el perfil elegido (las que salen en la lista). Cambia al cambiar de perfil.
  - CA-1: Cuenta solo apps de la lista que siguen en el móvil (instaladas o desactivadas); las ya quitadas no cuentan.
  - CA-2: Las apps que Poda no toca nunca cuentan en el total, así que ningún perfil llega al 100 % si el origen tiene alguna.
  - CA-3: La suma de todos los orígenes es el número de apps de la lista del perfil.
  - CA-4: Cada fila dice el porcentaje y «N de M»; el título nombra el perfil y un texto explica qué se queda. Los orígenes van de más a menos porcentaje.
- **R-002** Textos en los cinco idiomas; el cálculo vive en `@poda/nucleo` (`nivelesPorOrigen`, `enPerfil`).

## Pruebas

- R-001 CA-1 a CA-3: «005 R-001 …» en `packages/nucleo/test/nucleo.test.mjs`.
- R-001 CA-4 y R-002: «005 R-002» en `apps/web/test/textos.test.mjs` y revisión en `/conectar/?demo`.
