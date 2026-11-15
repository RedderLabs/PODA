# Al elegir perfil, qué viene marcado

Estado: implementada (pedida por el usuario el 15 de noviembre de 2026).

## Problema

Desde `b8755be`, al elegir un perfil venían marcadas todas sus apps. En «Recomendado» eso marcaba todas las avanzadas, y en «Experto» también las de experto. Entre ellas hay apps que mucha gente usa: la cámara de Android (`com.android.camera`, la de muchos móviles), la calculadora, el gestor de contraseñas y llaves de acceso (`com.android.credentialmanager`), los Servicios de operador de Google (RCS), TalkBack o Android Auto. El usuario pide que «Recomendado» marque las seguras y las avanzadas, y que «Experto» marque las anteriores y deje sin marcar las de experto. Después precisó que en «Recomendado» las avanzadas marcadas deben ser las del fabricante y de terceros, como dice la descripción del perfil («servicios del fabricante y la operadora»). (Una primera versión dejó sin marcar todas las avanzadas: era una mala lectura de la petición y se corrigió el mismo día.)

## Requisitos

- **R-001** Al elegir un perfil vienen marcadas las seguras y las avanzadas del fabricante, la operadora y terceros. Las avanzadas de Android base y Google y las de experto salen en la lista sin marcar.
  - CA-1: En «Recomendado», una avanzada viene marcada si y solo si su origen es fabricante, operadora o terceros. La operadora va `(por defecto)`: el usuario nombró fabricante y terceros; la descripción del perfil incluye la operadora.
  - CA-2: En «Experto» vienen marcadas exactamente las mismas que en «Recomendado».
  - CA-3: El usuario puede marcar las demás una a una o con «Marcar todas»; al cambiar de perfil se vuelve a lo de por defecto.
- **R-002** Los grupos «Avanzadas» y «Para expertos» dicen qué viene sin marcar. La nota del paso, la de la lista, las preguntas frecuentes y los README dicen lo mismo, en los cinco idiomas.
- **R-003** La regla vive en `@poda/nucleo` (`marcadaPorDefecto`).

## Fuera de alcance

- El MCP y la línea de comandos: no marcan nada; el asistente propone la lista y el usuario confirma cada aplicación.

## Pruebas

- R-001 y R-003: «006 R-001» en `packages/nucleo/test/nucleo.test.mjs`.
- R-002: «006 R-002» en `apps/web/test/textos.test.mjs`.
- Revisión en `/conectar/?demo`: en «Recomendado» las avanzadas de Android base y Google salen sin marcar; en «Experto» el botón cuenta las mismas que en «Recomendado».
