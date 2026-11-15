# Plan: llamadas, mensajes, contactos y ubicación protegidos

## Enfoque

En `packages/nucleo/src/protecciones.ts`:

1. Grupo nuevo en `PROTEGIDOS`, **«Teléfono, mensajes y contactos»**:
   - Teléfono: `com.android.dialer`, `com.google.android.dialer`, `com.android.incallui` (Xiaomi), `com.samsung.android.dialer`, `com.samsung.android.app.telephonyui`, `com.samsung.android.incall.contentprovider`, `com.oneplus.dialer`, `com.asus.dialer`, `com.tct.dialer`, `com.qti.phone`, `com.google.android.telephony`.
   - SMS y MMS: `com.android.mms` (Xiaomi, Huawei, vivo, OPPO), `com.android.messaging`, `com.google.android.apps.messaging`, `com.samsung.android.messaging`, `com.oneplus.mms`, `com.zui.mms`, `com.sonyericsson.android.conversations`, `com.transsion.smartmessage`, `com.miui.smsextra`, `com.mediatek.mms.appservice`, `com.android.basicsmsreceiver`, `com.android.smspush`.
   - Configuración de la operadora por SMS (APN): `com.huawei.omacp`, `com.hihonor.omacp`, `com.vivo.omacp`, `com.zte.zdm.omacp`.
   - Contactos: `com.android.contacts`, `com.google.android.contacts`, `com.google.android.syncadapters.contacts`, `com.samsung.android.app.contacts`, `com.samsung.android.contacts`, `com.samsung.android.providers.contacts`, `com.huawei.contacts`, `com.hihonor.contacts`, `com.oneplus.contacts`, `com.asus.contacts`, `com.sonymobile.android.contacts`, `com.zui.contacts`, `cn.nubia.contacts`.
   - SIM y emergencia: `com.android.stk`, `com.android.stk2`, `com.android.emergency`.
2. Grupo nuevo en `PROTEGIDOS`, **«Ubicación y GPS»**: `com.android.location.fused` (se mueve aquí), `com.google.android.location`, `com.qualcomm.location`, `com.qualcomm.location.XT`, `com.mediatek.location.lppe.main`, `com.mediatek.location.mtknlp`, `com.mediatek.nlpservice`, `com.huawei.lbs`, `com.samsung.android.location`, `com.sec.location.nsflp2`, `com.xiaomi.bsp.gps.nps`, `com.vivo.multinlp`.
3. De `AVISO_PODA` salen los que pasan a protegidos (Teléfono, Mensajes, Contactos, sincronización de contactos, menú de la SIM, configuración por SMS y emergencia). Entran los relojes de fabricante: Samsung, Huawei, Honor, OPPO, OnePlus, vivo, LG, ASUS, Transsion, Lenovo, Nubia y ZTE.
4. Traducciones de los dos grupos y de los avisos en `traducciones/{en,pt,fr,ca}.ts`.
5. README y README.en: lo que nunca se toca, lo que va a experto y la selección por defecto.
6. `pnpm resumen` y las tablas de recuento del README y de COMPATIBILIDAD.

## Cómo se cubre cada requisito

| Requisito | Prueba (`packages/nucleo/test/nucleo.test.mjs`, salvo indicación) |
|---|---|
| R-001 | «004 R-001»: cada paquete de la lista es `bloqueado` y no entra en el plan experto |
| R-001 CA-2 | Ya cubierto en el MCP: `aplicar` rechaza lo protegido antes que nada (spec 001) |
| R-002 | «004 R-002»: igual con la lista de ubicación |
| R-003 | «004 R-003»: relojes de fabricante en `experto`, con aviso en cada idioma (la prueba de idiomas existente comprueba las claves) |
| R-004 | Revisión de `/sin-pc/` y de los README |

## Riesgos

- Se pierde algo de limpieza de privacidad: `com.qualcomm.location` y `…location.XT` envían ubicación a Qualcomm y UAD-ng los da por seguros. Se acepta por la decisión del usuario.
- Quien usaba el perfil experto para quitar la app de SMS de Google (porque usa otra) ya no puede. Se acepta: es lo que pide la regla.
