# Llamadas, mensajes, contactos y ubicación protegidos en cualquier móvil

Estado: implementada (aprobada por el usuario el 15 de noviembre de 2026).

## Problema

El README promete que llamadas, SMS, contactos y reloj solo se pueden quitar en el perfil experto y con aviso. El código solo lo cumplía con las apps de Android puro y de Google. Las de cada fabricante salían en «seguro» o «avanzado», y entraban marcadas en el perfil recomendado. Por ejemplo:

- la app de Teléfono de Samsung, OnePlus, ASUS y TCL;
- la de Mensajes de Samsung, y `com.android.mms`, que es la de Xiaomi, Huawei, vivo y OPPO;
- los contactos de casi todas las marcas;
- los relojes de casi todas las marcas.

En un Samsung, el perfil recomendado marcaba por defecto Teléfono, Mensajes, Contactos y Reloj.

El usuario ha decidido que llamar, recibir llamadas, mandar SMS y MMS, encontrar contactos y la ubicación (GPS) tienen que funcionar siempre, aunque se haga «algo extremo».

## Fuera de alcance

- Telemetría de ubicación, servicios de ubicación solo para China, registros (logs) y herramientas de prueba: siguen con el nivel de UAD-ng.
- Extras de operadora, grabadora de llamadas, resúmenes con IA y «buscar mi móvil».
- Teclados, cámaras, galerías y navegadores de fabricante. El README también los promete, pero se dejan para otra especificación.

## Comportamiento anterior

- Protegidos (nunca se tocan): servicio de telefonía, gestor de llamadas, IMS, operadora, base de datos de SMS y MMS, envío de MMS, alertas de emergencia, red, `com.android.location.fused` y Google Play Services.
- En «experto», con aviso: Teléfono, Mensajes y Contactos de Android puro y de Google, el menú de la SIM, la configuración por SMS de la operadora y la información de emergencia.

## Requisitos

- **R-001** Ninguna vía quita ni desactiva, en ningún perfil, las apps para llamar, recibir llamadas, mandar SMS y MMS y ver los contactos, de cualquier fabricante conocido. Tampoco el menú de la SIM, la configuración de la operadora por SMS ni la información de emergencia.
  - CA-1: Dada cualquiera de esas apps en el móvil, cuando se calcula el plan de cualquier perfil (también experto), entonces no aparece.
  - CA-2: Dada una de esas apps, cuando se pide aplicarla por el MCP (quitar o desactivar), entonces se rechaza por estar protegida.
  - CA-3: Se puede restaurar si ya estaba quitada: restaurar nunca se bloquea.
- **R-002** Ninguna vía quita ni desactiva, en ningún perfil, las apps que dan la ubicación al sistema (GPS y ubicación por red) de los fabricantes conocidos.
  - CA-1: Igual que R-001 CA-1 y CA-2 para la lista de ubicación.
- **R-003** Los relojes de fabricante solo se pueden quitar en el perfil experto, con el aviso «sin ella no suenan las alarmas».
  - CA-1: Dado un reloj de fabricante, entonces su nivel es «experto» y tiene aviso en los cinco idiomas.
- **R-004** La web y los README dicen lo que hace Poda.
  - CA-1: «Sin ordenador» lista los grupos nuevos (sale solo de `PROTEGIDOS`).
  - CA-2: El README deja de decir que las apps con icono vienen desmarcadas: desde `b8755be` vienen marcadas con la etiqueta «tiene icono».

- **R-005** La página de conectar dice, antes y después de conectar el móvil, qué apps no se quitan nunca y por qué.
  - CA-1: `/conectar/` muestra todos los grupos de `PROTEGIDOS`, con su motivo y su lista de paquetes, en los cinco idiomas.
  - CA-2: Explica que no se quitan en ningún perfil (también experto) y que restaurar sí es posible.

## Requisitos no funcionales

- Las listas viven solo en `packages/nucleo/src/protecciones.ts` (una sola fuente de verdad).
- Los textos de los grupos y avisos, en los cinco idiomas.

## Dudas

- Decidido `(por defecto)`: el reloj va a «experto con aviso» y no a protegido, porque el usuario habló de llamadas, SMS, MMS y GPS. Pasarlo a protegido es moverlo de lista.
