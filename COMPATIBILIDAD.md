# Compatibilidad

Resumen rápido:

- **Android:** compatible prácticamente cualquier móvil. Poda no depende del modelo, sino de que el móvil acepte adb. La lista sabe qué hacer con unos 5.400 paquetes.
- **Huawei con HarmonyOS NEXT:** no compatible, porque ya no es Android.
- **iPhone y iPad:** no se puede hacer lo mismo. Apple solo deja borrar algunas apps a mano (detalles al final).

## Requisitos

| | Requisito |
|---|---|
| Quitar paquetes (`pm uninstall --user 0`) | Android 5.0 o superior. En versiones anteriores solo se puede desactivar. |
| Conexión por cable | Cualquier Android con «Depuración USB». |
| Conexión por Wi‑Fi sin cable | Android 11 o superior («Depuración inalámbrica» con código de 6 cifras). |
| Vía prompt + MCP | Ordenador con Windows, macOS o Linux, Node 18+ y `adb` (Android Platform Tools). |
| Vía web (WebUSB) | Chrome, Edge, Brave u Opera de escritorio, en una página HTTPS. Firefox y Safari no tienen WebUSB. En Windows hay que cerrar antes cualquier `adb` que esté abierto, porque solo un programa puede usar la conexión a la vez. |
| Root o bootloader | **No hace falta.** |

## Fabricantes

Todos los móviles Android pasan por el mismo proceso. Lo que cambia es cuántos paquetes de ese fabricante conoce la lista y en qué nivel están. Los números son paquetes propios del fabricante, con las correcciones de Poda sobre la lista de UAD-ng (lo que interviene en el arranque, la red móvil o la pantalla de inicio pasa a «bloqueado»). A eso se suman, en cualquier marca, 254 de operadoras, 184 de Google, 433 de terceros (Facebook, Microsoft, Netflix…) y 273 de Android base.

| Fabricante | Paquetes conocidos | Seguro | Avanzado | Experto | Bloqueado | Nota |
|---|---:|---:|---:|---:|---:|---|
| Samsung (One UI) | 808 | 480 | 220 | 73 | 35 | Desactivar «Bloqueador automático» mientras se usa (One UI 6+). |
| OPPO, realme y OnePlus (ColorOS / OxygenOS / realme UI) | 456 | 216 | 91 | 135 | 14 | |
| Huawei (EMUI / HarmonyOS 4 o anterior) | 239 | 162 | 48 | 22 | 7 | HarmonyOS NEXT (5+) no es Android: no compatible. |
| Xiaomi, Redmi y POCO (HyperOS / MIUI) | 229 | 154 | 41 | 24 | 10 | Activar también «Depuración USB (ajustes de seguridad)»; pide cuenta Xiaomi. |
| LG | 182 | 101 | 45 | 30 | 6 | |
| Motorola | 175 | 94 | 52 | 17 | 12 | |
| Google Pixel | 150 | 43 | 44 | 42 | 21 | Poco bloatware; casi todo son servicios de Google. |
| vivo e iQOO (Funtouch / OriginOS) | 149 | 100 | 16 | 24 | 9 | |
| Sony Xperia | 140 | 68 | 30 | 36 | 6 | |
| Nokia / HMD | 122 | 25 | 9 | 88 | 0 | La mayoría de su lista está en nivel experto. |
| TCL y Alcatel | 113 | 42 | 20 | 51 | 0 | |
| ZTE y nubia | 111 | 62 | 22 | 23 | 4 | |
| Tecno, Infinix e itel (Transsion) | 101 | 64 | 27 | 9 | 1 | |
| ASUS (ZenUI / ROG) | 86 | 52 | 10 | 19 | 5 | |
| Honor (MagicOS) | 85 | 47 | 21 | 11 | 6 | |
| Lenovo (ZUI) | 73 | 43 | 22 | 6 | 2 | |
| Meizu (Flyme) | 39 | 26 | 5 | 7 | 1 | |
| Nothing (Nothing OS) | 24 | 10 | 7 | 5 | 2 | |
| Blackview | 23 | 18 | 4 | 1 | 0 | |

Una marca que no aparece aquí también funciona: Poda propone los paquetes de operadora, Google y terceros, y deja sin tocar los que no conoce.

Para regenerar los números después de actualizar la lista: `pnpm build && pnpm resumen`.

### Qué significa cada nivel

| Nivel | Qué es | Perfiles que lo incluyen |
|---|---|---|
| **Seguro** | Anuncios, telemetría, duplicados, apps de relleno. Quitarlo no rompe nada. | Seguro, Recomendado, Experto |
| **Avanzado** | Servicios que funcionan pero que mucha gente no usa (asistentes, tiendas del fabricante…). Puedes echar algo en falta. | Recomendado, Experto |
| **Experto** | Puede afectar a funciones del sistema. Solo si sabes lo que quitas. | Experto |
| **Bloqueado** | Puede dejar el móvil sin arrancar. **Poda no lo toca nunca.** | Ninguno |

Los niveles vienen de la lista de Universal Android Debloater Next Generation (equivalencias: *Recommended* → seguro, *Advanced* → avanzado, *Expert* → experto, *Unsafe* → bloqueado), con las correcciones de Poda de [`packages/nucleo/src/protecciones.ts`](packages/nucleo/src/protecciones.ts): lo que interviene en el arranque, la red móvil, la pantalla de inicio o los servicios de Google pasa a bloqueado, y lo que se usa a diario (teclado, llamadas, SMS, reloj…) pasa a experto con aviso.

### Avisos por marca

- **Samsung:** desde One UI 6, el «Bloqueador automático» (Ajustes → Seguridad y privacidad) bloquea los comandos que llegan por USB. Hay que apagarlo mientras dure la limpieza y volver a encenderlo al terminar. En los Galaxy que salen de fábrica con One UI 6.1.1 viene activado por defecto.
- **Xiaomi, Redmi y POCO:** además de «Depuración USB» hay que activar «Depuración USB (ajustes de seguridad)», que pide iniciar sesión con cuenta Xiaomi. Las actualizaciones del sistema suelen volver a apagarlo.
- **Huawei:** los modelos con EMUI o HarmonyOS 4.x o anterior son Android y funcionan. HarmonyOS NEXT (5 o superior, por ejemplo la serie Mate 70 en China) ya no lleva Android y usa su propia herramienta en lugar de adb, así que **no es compatible**. Los Huawei que se venden en España siguen con EMUI.
- **Cualquier marca:** algunos paquetes no se dejan quitar pero sí desactivar. Poda lo intenta en ese orden de forma automática.

## Apple (iPhone y iPad)

**No hay un equivalente a Poda en iOS.** Apple no permite que un ordenador quite apps del sistema sin jailbreak, y no hay nada parecido a adb. Lo que sí se puede hacer a mano:

**Borrar apps de Apple.** Con iOS 14 o superior se pueden eliminar estas apps preinstaladas (mantener pulsada → Eliminar app): Actividad, Libros, Apple TV, Calculadora, Calendario, Reloj, Brújula, Contactos, FaceTime, Archivos, Buscar, Freeform, Salud, Casa, iTunes Store, Mail, Mapas, Medidas, Música, News (donde exista), Notas, Podcasts, Recordatorios, Atajos, Bolsa, Consejos, Traducir, TV, Notas de voz, Cartera, Watch y Tiempo. Se recuperan desde el App Store.

**En la Unión Europea, además:** Mensajes, App Store, Cámara, Fotos y Safari (desde iOS 18.2), y Teléfono solo en iPad. Teléfono (en iPhone) y Ajustes no se pueden borrar nunca. En Japón, además, Safari en iPhone.

**Ocultar sin borrar:** «Eliminar de la pantalla de inicio» deja la app en la Biblioteca de apps. Para ocultar del todo algunas apps del sistema existe Ajustes → Tiempo de uso → Restricciones de contenido y privacidad → Apps permitidas.

**Ojo con los efectos secundarios:** borrar Música, Mapas, Libros o Podcasts los quita también de CarPlay; borrar Salud o Watch obliga a desvincular antes el Apple Watch; borrar Buscar hace que dejes de ver tus AirTags en ese dispositivo.

## Fuentes

- Lista de paquetes: [Universal Android Debloater Next Generation](https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation) (GPL‑3.0)
- [Android Debug Bridge (adb), documentación de Android](https://developer.android.com/tools/adb): depuración inalámbrica desde Android 11
- [Tango / ya-webadb](https://docs.tangoapp.dev/tango/daemon/usb): WebUSB solo en navegadores Chromium y conflicto con adb en Windows
- [Samsung — Bloqueador automático](https://www.samsung.com/ae/support/mobile-devices/protect-your-galaxy-device-with-the-new-auto-blocker-feature/)
- [hyperos-debloater](https://github.com/ovsky/hyperos-debloater): ajuste de seguridad de Xiaomi
- [Xataka Android — HarmonyOS NEXT sin adb](https://www.xatakandroid.com/sistema-operativo/harmonyos-next-no-oficial-europa-he-probado-hice-mi-primera-aplicacion)
- [Apple — Apps integradas que se pueden borrar](https://support.apple.com/118582) y [apps adicionales en la UE y Japón](https://support.apple.com/121327)
- [MacRumors — iOS 18.2 en la UE](https://www.macrumors.com/2024/10/23/ios-18-2-eu-delete-apps/)
