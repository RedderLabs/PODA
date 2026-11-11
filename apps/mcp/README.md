# poda-mcp

Servidor MCP y línea de comandos de Poda. Sirven para que Claude (u otro asistente) analice un móvil Android por adb y quite el bloatware **con copia previa y confirmación explícita**.

## Instalar

Desde la raíz del monorepo:

```bash
pnpm install
pnpm build --filter=@poda/mcp...
```

Necesita Node 18 o superior y `adb` en el PATH, o su ruta en `PODA_ADB`.

## Conectarlo a Claude

**Claude Code:**

```bash
claude mcp add poda -- node /ruta/a/poda/apps/mcp/dist/index.js
```

**Claude Desktop** (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "poda": {
      "command": "node",
      "args": ["/ruta/a/poda/apps/mcp/dist/index.js"]
    }
  }
}
```

## Herramientas

| Herramienta | Qué hace | ¿Cambia algo? |
|---|---|---|
| `dispositivos` | Móviles conectados y su estado | No |
| `emparejar_wifi` | Empareja por depuración inalámbrica (Android 11+) | No |
| `conectar_wifi` | Conecta con un móvil emparejado | No |
| `info_dispositivo` | Marca, modelo, Android y avisos de la marca | No |
| `analizar` | Cruza los paquetes con la lista y propone según el perfil | No |
| `explicar_paquete` | Qué es un paquete, nivel y dependencias | No |
| `crear_copia` | Guarda el estado de todos los paquetes en `~/.poda/copias` | Solo en el ordenador |
| `listar_copias` | Copias guardadas | No |
| `aplicar` | Quita o desactiva paquetes. Sin `confirmar` solo da el plan | **Sí** |
| `restaurar` | Reinstala y reactiva paquetes, o vuelve a una copia | **Sí** |

También expone un prompt, `limpiar_movil`, con el flujo completo.

### Protecciones

- `aplicar` sin `confirmar: true` es una simulación.
- Con `confirmar: true` exige una copia del mismo móvil de las últimas 24 h.
- Los paquetes de nivel **bloqueado** se rechazan siempre.
- Los paquetes que no están en la lista se rechazan salvo `incluir_fuera_de_lista: true`.
- Los nombres de paquete se validan antes de llegar a `adb shell` (evita inyección de comandos).
- Si un paquete no se deja quitar, se intenta desactivar.
- Cada cambio queda registrado en `~/.poda/registro.jsonl`.

## Línea de comandos

Lo mismo, a mano:

```bash
node dist/cli.js dispositivos
node dist/cli.js analizar --perfil recomendado
node dist/cli.js copia
node dist/cli.js aplicar com.miui.msa.global com.miui.analytics            # plan
node dist/cli.js aplicar com.miui.msa.global com.miui.analytics --confirmar
node dist/cli.js restaurar --copia 2026-11-11T05-30-00-000Z.json
```

## Variables de entorno

| Variable | Para qué |
|---|---|
| `PODA_ADB` | Ruta del binario adb (por defecto `adb`) |
| `PODA_DIR` | Carpeta de copias y registro (por defecto `~/.poda`) |
| `PODA_LISTA` | Otra lista de paquetes en formato UAD |

## Pruebas

```bash
pnpm test --filter=@poda/mcp
```

Recorre el flujo completo con un adb simulado (`test/adb-falso.mjs`, un Xiaomi ficticio): análisis por perfiles, simulación, negativa sin copia, aplicar, recurso a desactivar, rechazo de paquetes bloqueados e intentos de inyección, restaurar paquete a paquete y desde copia, y la línea de comandos.

## Licencia

GPL‑3.0 o posterior. La lista de paquetes (`data/uad_lists.json`) es de [Universal Android Debloater Next Generation](https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation), también GPL‑3.0.
