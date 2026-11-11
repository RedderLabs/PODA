# Restaurar

Poda nunca borra las apps del sistema: las quita **para tu usuario** o las desactiva. Por eso todo se puede devolver.

## Desde la web

1. Conecta el móvil en [podamovil.com/conectar](https://podamovil.com/conectar/).
2. Pulsa **Restaurar una copia**.
3. Elige una copia guardada en el navegador o sube el archivo `poda-copia-….json` que se descargó al limpiar.
4. Marca las apps que quieres de vuelta (por defecto, todas) y pulsa **Restaurar**.
5. Reinicia el móvil desde la propia web.

Justo después de limpiar, la pantalla de resultado tiene además **Deshacer estos cambios**.

## Sin la web, con adb

Una app concreta:

```bash
adb shell cmd package install-existing --user 0 com.ejemplo.app
adb shell pm enable --user 0 com.ejemplo.app
```

En Android 7 o anterior, si `cmd package` no existe: `adb shell pm install-existing --user 0 com.ejemplo.app`.

Todo desde el archivo de copia, en Windows (PowerShell):

```powershell
$c = Get-Content "$HOME\Downloads\poda-copia-….json" -Raw | ConvertFrom-Json
$c.paquetes.PSObject.Properties | Where-Object { $_.Value -eq "instalado" -and $_.Name -like "*.*" } |
  ForEach-Object { adb shell cmd package install-existing --user 0 $_.Name; adb shell pm enable --user 0 $_.Name }
adb reboot
```

En macOS o Linux (con `jq`):

```bash
jq -r '.paquetes | to_entries[] | select(.value=="instalado") | .key' poda-copia-….json |
  while read p; do adb shell cmd package install-existing --user 0 "$p"; adb shell pm enable --user 0 "$p"; done
adb reboot
```

## Con Claude

Pide «restaura mi móvil con la última copia de Poda». El MCP tiene `listar_copias` y `restaurar`, que también acepta paquetes sueltos.

## Si el móvil no arranca

Mira [rescate.md](rescate.md).
