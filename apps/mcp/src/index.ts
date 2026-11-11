#!/usr/bin/env node
// Poda MCP: deja que un asistente (Claude u otro) analice y limpie un móvil Android
// con adb, siempre con copia de seguridad previa y confirmación explícita.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as adb from "./adb.js";
import { listarCopias } from "./copias.js";
import * as logica from "./logica.js";

const VERSION = "0.1.0";
const server = new McpServer({ name: "poda", version: VERSION });

const texto = (t: string) => ({ content: [{ type: "text" as const, text: t }] });
const json = (o: unknown) => texto(JSON.stringify(o, null, 2));
const fallo = (e: unknown) => ({ content: [{ type: "text" as const, text: `Error: ${e instanceof Error ? e.message : String(e)}` }], isError: true });

const serieOpcional = z.string().optional().describe("Serie del móvil (de `dispositivos`). Si solo hay uno conectado, se puede omitir.");

// ---------------------------------------------------------------- dispositivos
server.registerTool(
  "dispositivos",
  {
    title: "Móviles conectados",
    description: "Lista los móviles Android que ve adb (por USB o Wi‑Fi) y su estado. «unauthorized» significa que falta aceptar el aviso en la pantalla del móvil.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    try {
      const d = await adb.dispositivos();
      if (d.length === 0) return texto("No hay ningún móvil conectado. Conecta el cable y acepta el aviso de depuración, o usa emparejar_wifi.");
      return json(d);
    } catch (e) {
      return fallo(e);
    }
  },
);

server.registerTool(
  "emparejar_wifi",
  {
    title: "Emparejar por Wi‑Fi",
    description:
      "Empareja el ordenador con el móvil por depuración inalámbrica (Android 11+). En el móvil: Opciones de desarrollador → Depuración inalámbrica → Vincular dispositivo con código. Usa la IP:puerto y el código de 6 cifras que aparecen en esa ventana. Después llama a conectar_wifi.",
    inputSchema: {
      direccion: z.string().describe("IP:puerto de la ventana de vinculación, p. ej. 192.168.1.40:37099"),
      codigo: z.string().describe("Código de 6 cifras"),
    },
  },
  async ({ direccion, codigo }) => {
    try {
      const r = await adb.emparejar(direccion, codigo);
      return texto((r.salida + r.error).trim() || "Hecho.");
    } catch (e) {
      return fallo(e);
    }
  },
);

server.registerTool(
  "conectar_wifi",
  {
    title: "Conectar por Wi‑Fi",
    description: "Conecta con un móvil ya emparejado. La IP:puerto es la que aparece arriba en «Depuración inalámbrica» (no es la de vincular).",
    inputSchema: { direccion: z.string().describe("IP:puerto, p. ej. 192.168.1.40:41235") },
  },
  async ({ direccion }) => {
    try {
      const r = await adb.conectar(direccion);
      return texto((r.salida + r.error).trim());
    } catch (e) {
      return fallo(e);
    }
  },
);

server.registerTool(
  "info_dispositivo",
  {
    title: "Información del móvil",
    description: "Marca, modelo, versión de Android y capa del fabricante, más avisos concretos para esa marca.",
    inputSchema: { serie: serieOpcional },
    annotations: { readOnlyHint: true },
  },
  async ({ serie }) => {
    try {
      return json(await logica.infoDispositivo(serie));
    } catch (e) {
      return fallo(e);
    }
  },
);

// ---------------------------------------------------------------- análisis
server.registerTool(
  "analizar",
  {
    title: "Analizar el móvil",
    description:
      "Cruza los paquetes del móvil con la lista de Poda y propone qué quitar según el perfil. No cambia nada. Niveles: seguro (no rompe nada), avanzado (servicios que puedes echar en falta), experto (puede afectar a funciones), bloqueado (nunca se propone). Perfiles: seguro = solo nivel seguro; recomendado = seguro + avanzado; experto = + experto.",
    inputSchema: {
      serie: serieOpcional,
      perfil: z.enum(["seguro", "recomendado", "experto"]).default("recomendado"),
      max: z.number().int().min(1).max(1000).default(200).describe("Máximo de paquetes en la propuesta"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ serie, perfil, max }) => {
    try {
      return json(await logica.analizar({ serie, perfil, max }));
    } catch (e) {
      return fallo(e);
    }
  },
);

server.registerTool(
  "explicar_paquete",
  {
    title: "Explicar un paquete",
    description: "Devuelve lo que se sabe de un paquete: de dónde viene, nivel de riesgo, descripción (en inglés, de la lista UAD) y dependencias. Tradúcelo y explícalo al usuario con tus palabras.",
    inputSchema: { paquete: z.string() },
    annotations: { readOnlyHint: true },
  },
  async ({ paquete }) => {
    const r = logica.explicar(paquete);
    if (!r) {
      return texto(
        `${paquete} no está en la lista de Poda. Explícale al usuario que no hay información sobre él y que, si aun así quiere tocarlo, lo prudente es desactivarlo en vez de quitarlo.`,
      );
    }
    return json(r);
  },
);

// ---------------------------------------------------------------- copias
server.registerTool(
  "crear_copia",
  {
    title: "Crear copia de seguridad",
    description: "Guarda el estado actual de todos los paquetes del móvil (instalado, desactivado o quitado) en ~/.poda/copias. Es obligatoria antes de aplicar cambios.",
    inputSchema: { serie: serieOpcional },
  },
  async ({ serie }) => {
    try {
      return json(await logica.crearCopia(serie));
    } catch (e) {
      return fallo(e);
    }
  },
);

server.registerTool(
  "listar_copias",
  {
    title: "Ver copias",
    description: "Lista las copias de seguridad guardadas, de la más reciente a la más antigua.",
    inputSchema: { serie: z.string().optional() },
    annotations: { readOnlyHint: true },
  },
  async ({ serie }) => json(listarCopias(serie)),
);

// ---------------------------------------------------------------- cambios
server.registerTool(
  "aplicar",
  {
    title: "Quitar o desactivar paquetes",
    description:
      "Quita (pm uninstall -k --user 0) o desactiva (pm disable-user) paquetes para el usuario principal. El APK sigue en el sistema y todo se puede deshacer con restaurar. Sin confirmar=true solo devuelve el plan. Con confirmar=true exige una copia de las últimas 24 h y rechaza siempre los paquetes de nivel bloqueado. Llama con confirmar=true SOLO después de que el usuario haya dicho que sí a esa lista concreta.",
    inputSchema: {
      serie: serieOpcional,
      paquetes: z.array(z.string()).min(1).max(500),
      modo: z.enum(["quitar", "desactivar"]).default("quitar"),
      confirmar: z.boolean().default(false),
      incluir_fuera_de_lista: z.boolean().default(false).describe("Permite paquetes que no están en la lista. Solo si el usuario lo pide expresamente."),
    },
    annotations: { destructiveHint: true },
  },
  async ({ serie, paquetes, modo, confirmar, incluir_fuera_de_lista }) => {
    try {
      return json(await logica.aplicar({ serie, paquetes, modo, confirmar, incluir_fuera_de_lista }));
    } catch (e) {
      return fallo(e);
    }
  },
);

server.registerTool(
  "restaurar",
  {
    title: "Restaurar paquetes",
    description:
      "Deshace cambios: vuelve a instalar (cmd package install-existing) y reactiva paquetes. Indica una lista de paquetes, o el archivo de una copia (de listar_copias) para dejar el móvil como estaba entonces.",
    inputSchema: {
      serie: serieOpcional,
      paquetes: z.array(z.string()).optional(),
      copia: z.string().optional().describe("Nombre del archivo de la copia, p. ej. 2026-11-11T05-30-00-000Z.json"),
    },
  },
  async ({ serie, paquetes, copia }) => {
    try {
      return json(await logica.restaurar({ serie, paquetes, copia }));
    } catch (e) {
      return fallo(e);
    }
  },
);

// ---------------------------------------------------------------- prompt guiado
server.registerPrompt(
  "limpiar_movil",
  {
    title: "Limpiar mi móvil",
    description: "Guía completa: conectar, analizar, explicar, copia, aplicar y comprobar.",
    argsSchema: { perfil: z.enum(["seguro", "recomendado", "experto"]).optional() },
  },
  ({ perfil }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: [
            `Quiero limpiar mi móvil Android con Poda, perfil ${perfil ?? "recomendado"}.`,
            "1. Comprueba con `dispositivos` que el móvil está conectado; si no, ayúdame a emparejarlo por Wi‑Fi o por cable.",
            "2. Llama a `info_dispositivo` y avísame de lo que necesite mi marca.",
            "3. Llama a `analizar` y explícame la propuesta en español sencillo, agrupada por para qué sirve cada cosa (anuncios, apps de la operadora, servicios del fabricante…). Señala lo que podría echar de menos.",
            "4. Deja que quite o añada cosas. Enséñame el plan con `aplicar` sin confirmar.",
            "5. Crea una copia con `crear_copia` y, solo cuando yo diga que sí, aplica con confirmar=true.",
            "6. Dime qué se hizo, qué falló y cómo deshacerlo con `restaurar`. Recuérdame desactivar la depuración al terminar.",
          ].join("\n"),
        },
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
