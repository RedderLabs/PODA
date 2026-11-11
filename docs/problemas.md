# Problemas al conectar

## El navegador dice que no es compatible

Hace falta WebUSB, que solo tienen **Chrome, Edge, Brave y Opera de escritorio**. Firefox y Safari no lo incluyen y desde un iPhone no se puede. La página tiene que abrirse con `https://` (o en `localhost` si la ejecutas tú).

## «Otro programa está usando el móvil»

En Windows, el USB del móvil solo lo puede usar un programa a la vez. Suelen ser:

- **adb** (Android Platform Tools), aunque no tengas ninguna ventana abierta: ejecuta `adb kill-server`.
- Android Studio, scrcpy u otras herramientas de desarrollo.
- Programas del fabricante: Samsung Smart Switch, Mi PC Suite, HiSuite…

Ciérralos y vuelve a pulsar **Conectar móvil**.

## El móvil no aparece en la lista del navegador

- Comprueba que el **cable es de datos**, no solo de carga. Prueba otro cable u otro puerto.
- Comprueba que **«Depuración USB»** está activada en Opciones de desarrollador.
- Si el móvil pregunta qué hacer con el USB, elige **«Transferencia de archivos»**.
- En Windows, algunos móviles necesitan el [controlador USB de Google](https://developer.android.com/studio/run/win-usb) o el del fabricante.

## No aparece el aviso «¿Permitir depuración USB?» en el móvil

Desenchufa y vuelve a enchufar con la pantalla desbloqueada. Si sigue sin salir: Opciones de desarrollador → **Revocar autorizaciones de depuración USB**, y vuelve a conectar.

## Xiaomi, Redmi y POCO

Además de «Depuración USB», activa **«Depuración USB (ajustes de seguridad)»**. Pide iniciar sesión con cuenta Xiaomi y, en algunas versiones, tener una SIM puesta. Sin ella, algunas apps no se dejarán quitar (Poda las desactiva en su lugar).

## Samsung

Desde One UI 6, el **Bloqueador automático** (Ajustes → Seguridad y privacidad) bloquea los comandos por USB. Apágalo mientras dure la limpieza y vuelve a encenderlo al terminar.

## Algunas apps «no se pudieron cambiar»

Suele ser porque el fabricante lo impide. Poda intenta primero quitarlas y, si no puede, desactivarlas. Si tampoco, lo dice y sigue con las demás: el resto del móvil no se ve afectado.

## Sigue sin funcionar

[Abre una issue](https://github.com/RedderLabs/PODA/issues/new/choose) con tu marca, modelo, versión de Android, navegador y sistema operativo del ordenador, y el texto exacto del error.
