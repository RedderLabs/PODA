# Si el móvil se queda en el logo

Tiene arreglo y **no hace falta borrar nada**. Quitar una app «para tu usuario» no la borra del sistema: Android solo apunta que está quitada. Basta con devolverla o con hacer que Android olvide esa nota.

> **No elijas «Factory reset» ni «Wipe data»** en el recovery: eso sí borra fotos, apps y ajustes. Es el último recurso.

## Opción 1: con el cable, desde el logo

Funciona si el ordenador ve el móvil mientras está en el logo. Cierra antes la pestaña de Poda.

1. Con el móvil conectado, escribe `adb devices`. Debe salir el número de serie seguido de `device`.
2. Devuelve las apps desde la copia (en Windows, PowerShell):

   ```powershell
   $c = Get-Content "$HOME\Downloads\poda-copia-….json" -Raw | ConvertFrom-Json
   adb logcat -b crash -d > "$HOME\Desktop\poda-crash.txt"
   $c.paquetes.PSObject.Properties | Where-Object { $_.Value -eq "instalado" -and $_.Name -like "*.*" } |
     ForEach-Object { adb shell cmd package install-existing --user 0 $_.Name; adb shell pm enable --user 0 $_.Name }
   adb reboot
   ```

   Si sale `Can't find service: package`, el sistema aún no está listo: espera un minuto y repite.

3. Si puedes, [abre una issue](https://github.com/RedderLabs/PODA/issues/new/choose) con el archivo `poda-crash.txt`: dice qué app lo provocó y así la sacamos de los perfiles.

## Opción 2: desde el recovery

Si el ordenador no ve el móvil en el logo. Funciona con TWRP o con el recovery de LineageOS, si tienen adb y el almacenamiento no está cifrado (o TWRP te deja descifrarlo con tu PIN).

1. Apaga el móvil manteniendo Encendido 15 segundos. Luego mantén **Volumen arriba + Encendido** hasta que salga el recovery.
2. En TWRP: **Mount** y marca **Data**. En el recovery de LineageOS: **Advanced → Enable ADB**.
3. En el ordenador, `adb devices` debe mostrar `recovery`. Entonces:

   ```bash
   adb shell cp /data/system/users/0/package-restrictions.xml /data/system/users/0/package-restrictions.xml.poda-bak
   adb shell rm /data/system/users/0/package-restrictions.xml
   adb reboot
   ```

Todas las apps vuelven a estar instaladas. Se pierden las apps elegidas por defecto (navegador, teclado…), que el móvil te volverá a preguntar, y vuelven a activarse las que tuvieras desactivadas.

En TWRP también puedes hacerlo sin ordenador: **Advanced → File Manager →** `data/system/users/0` y renombra `package-restrictions.xml`.

## Opción 3: si nada funciona

Un «Factory reset» desde el recovery devuelve el móvil al estado de fábrica con todas las apps, pero **borra tus datos**. Úsalo solo si las dos opciones anteriores no han funcionado.
