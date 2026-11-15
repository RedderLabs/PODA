# Descripciones de las apps en el idioma de la web

Estado: implementada (pedida por el usuario el 15 de noviembre de 2026).

## Problema

Las descripciones de cada app vienen de la lista de UAD-ng, en inglés (unas 5.400). Con la web en español, portugués, francés o catalán, el usuario lee «It's the same as (com.android.captiveportallogin)…» y no lo entiende.

Mandarlas a un servicio de traducción desde la web rompería la regla de que nada sale del ordenador del usuario. Primera versión: el traductor integrado del navegador. No sirvió en el navegador del usuario, que pidió «forzar las traducciones»: se traducen una vez, al preparar la web, y se publican con ella.

## Requisitos

- **R-001** Si el navegador tiene traductor integrado (Translator API de Chrome 138 o posterior), las descripciones de la lista se muestran traducidas al idioma de la web. La traducción se hace en el ordenador: ni las descripciones ni la lista de apps salen de él.
  - CA-1: Si el idioma ya está descargado, se traducen solas al abrir la lista.
  - CA-2: Si hay que descargarlo, aparece un botón «Traducir las descripciones»; la descarga empieza al pulsarlo (Chrome lo exige).
  - CA-3: Se traducen solo las descripciones de las apps que salen en la lista, y se guardan en el navegador para no repetir (si el navegador no deja guardar, funciona igual).
  - CA-4: Una nota dice que es traducción automática del navegador.
- **R-002** Si el navegador no puede traducir a ese idioma, las descripciones se ven en inglés y una nota lo dice.
- **R-003** Con la web en inglés no se hace nada.
- **R-004** La búsqueda encuentra apps por la descripción original y por la traducida.
- **R-005** Textos en los cinco idiomas. La nota de la lista deja de decir que las descripciones están siempre en inglés.
- **R-006** Las descripciones van traducidas con la web, sin depender del navegador.
  - CA-1: `data/descripciones/<idioma>.json` guarda la traducción de cada descripción, con clave = SHA-1 (10 caracteres) del texto en inglés que publica la web. `scripts/descripciones.mjs lotes` saca lo que falte y `unir` junta lo traducido.
  - CA-2: Al compilar, `public/descripciones-<idioma>.json` lleva paquete → traducción solo si la clave coincide con la descripción actual; si UAD-ng la cambia, se ve en inglés (o con el traductor del navegador) hasta que se traduzca.
  - CA-3: Las traducciones conservan nombres de paquete, enlaces y `código` (`scripts/comprobar-descripciones.mjs`).
  - CA-4: La lista usa primero la traducción publicada, luego la del navegador, luego el inglés. Una nota dice que son traducciones automáticas.
  - Las hizo un modelo de IA (Claude) el 15 de noviembre de 2026, revisadas con el comprobador. Falta revisión nativa.

## Fuera de alcance

- Los avisos de Poda (`AVISO_PODA`) ya están traducidos a mano en `packages/nucleo/src/traducciones/`.
- Traducciones hechas a mano de la lista de UAD-ng.

## Pruebas

- R-001 a R-003: `apps/web/test/traducir.test.mjs`, con un traductor de mentira (disponible, descargable, ausente; en inglés no se llama).
- R-005: «007 R-005» en `apps/web/test/textos.test.mjs`.
- R-006: «007 R-006» en `apps/web/test/textos.test.mjs` (cobertura y paquetes intactos) y `scripts/comprobar-descripciones.mjs`.
- Pendiente: probarlo en Chrome de verdad, en `/conectar/?demo`, con la web en español.
