# Singular y plural en los textos de la web

Estado: implementada (15 de noviembre de 2026). Aprobada `(por defecto)`: el usuario pidió seguir con lo pendiente sin elegir.

## Problema

Los textos de la web con una cantidad están escritos siempre en plural. Con una sola app se lee «1 apps de serie que puedes quitar», «Vas a quitar 1 apps» o «Te quedan 1 intentos», en los cinco idiomas. Se vio en la demo tras reiniciar, pero pasa en todas las pantallas que cuentan algo. Parece descuidado justo en los momentos de confianza: confirmar, el PIN y el resultado.

## Fuera de alcance

- Formato de los números (separador de miles).
- Textos del núcleo (avisos, niveles) y del MCP: ninguno lleva cantidades.
- Concordancias que no dependan de un número.

## Comportamiento actual

`fmt` sustituye `{clave}` por su valor. No sabe nada de singular ni de plural.

## Requisitos

- **R-001** Todo texto de la web que acompaña a una cantidad usa la forma que pide el idioma para esa cantidad.
  - CA-1: Dado el español y una cantidad de 1, cuando se muestra «quitables», entonces se lee «**1** app de serie que puedes quitar sin riesgo».
  - CA-2: Dado el español y una cantidad de 0 o de 2, entonces se usa el plural («0 apps», «2 apps»).
  - CA-3: Dado el francés o el portugués de Brasil y una cantidad de 0, entonces se usa el singular, como piden esas lenguas.
  - CA-4: Dado el inglés o el catalán y una cantidad de 1, entonces se usa el singular.

- **R-002** Quien traduce escribe las dos formas en el propio texto, sin tocar código: `{n|singular|plural}`. Las formas pueden llevar la cifra dentro: `{n|esta app|estas {n} apps}`.
  - CA-1: Dado un texto con `{n|app|apps}` y n = 1, cuando se formatea, entonces sale «app». Con n = 3, «apps».
  - CA-2: Dado un texto con `{clave}` sin formas, entonces se sustituye como hasta ahora.
  - CA-3: Dado un texto con formas para una clave que no viene en los datos, entonces queda tal cual (como `{clave}` hoy).

- **R-003** Las pruebas fallan si un idioma puede mostrar una cantidad sin la forma correcta.
  - CA-1: Dado un texto de `es.ts` con formas, cuando el mismo texto en otro idioma no tiene ninguna, entonces `pnpm test` falla y dice cuál. (No se exige la misma variable: el inglés no necesita formas en «safe» o «advanced».)
  - CA-2: Dado un texto de cualquier idioma con una cifra seguida de «apps», «applis», «intentos» o sus traducciones sin formas, entonces `pnpm test` falla y dice cuál.

## Requisitos no funcionales

- Sin dependencias nuevas. `Intl.PluralRules` está en todos los navegadores con WebUSB y en Node 20.
- La web sigue siendo estática.

## Dudas

Ninguna pendiente.

## Verificación

| Requisito | Cómo se comprobó |
|---|---|
| R-001 | Pruebas «002 R-001» con los textos reales (fallaban antes). En el HTML generado no queda ningún «1 apps». Falta recorrer la demo en un navegador: no había ninguno automatizable |
| R-002 | Pruebas «002 R-002» en `packages/nucleo/test/nucleo.test.mjs` |
| R-003 | Pruebas «002 R-003» y «002 R-001» de `apps/web/test/textos.test.mjs`: detectaban los 23 textos de cada idioma antes de corregirlos |
