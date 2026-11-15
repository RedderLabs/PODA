// Fondo de recuerdo (specs/010): una imagen con el robot de Poda que se deja en la galería del móvil.
// Poda no cambia el fondo: sin root no puede guardar el que hay ni devolverlo.
// La ruta es fija y los comandos no llevan nada que venga del usuario ni del móvil.
import type { Familia } from "./ficha.js";

export const FONDO = {
  archivo: "poda-fondo.png",
  carpeta: "/sdcard/Pictures/Poda",
  ruta: "/sdcard/Pictures/Poda/poda-fondo.png",
  ancho: 1440,
  alto: 3200,
} as const;

/** Crea la carpeta de la imagen (si ya existe, no hace nada). */
export const COMANDO_CARPETA_FONDO: readonly string[] = ["mkdir", "-p", FONDO.carpeta];

/**
 * Pide a la galería que vea la imagen sin esperar. En Android 10 o más este aviso está obsoleto y
 * algunas marcas lo ignoran; desde Android 11 la galería suele verla sola. Si falla, no pasa nada.
 */
export const COMANDO_AVISAR_GALERIA: readonly string[] = [
  "am",
  "broadcast",
  "-a",
  "android.intent.action.MEDIA_SCANNER_SCAN_FILE",
  "-d",
  `file://${FONDO.ruta}`,
];

/** Marcas con pasos propios para poner el fondo; el resto usa los generales. */
export type MarcaFondo = "xiaomi" | "samsung" | "oppo" | "general";
export const MARCAS_FONDO: readonly MarcaFondo[] = ["xiaomi", "samsung", "oppo", "general"];

export function marcaFondo(familia: Familia): MarcaFondo {
  if (familia === "xiaomi") return "xiaomi";
  if (familia === "samsung") return "samsung";
  if (familia === "oplus") return "oppo";
  return "general";
}

/** Textos del fondo en español. Las traducciones, en ./traducciones/ (clave `fondo`). */
export interface TextosFondo {
  /** Pasos para ponerla de fondo desde la galería, por marca. */
  pasos: Record<MarcaFondo, string[]>;
  /** Por si no aparece en la galería enseguida. */
  noAparece: string;
  /** Cómo borrarla si no la quiere. Restaurar no la borra. */
  borrar: string;
}

export const TEXTOS_FONDO: TextosFondo = {
  pasos: {
    xiaomi: [
      "Abre «Galería» y entra en el álbum «Poda».",
      "Abre la imagen y toca «Más» (los tres puntos).",
      "Toca «Establecer como fondo de pantalla» y elige pantalla de bloqueo, de inicio o las dos.",
    ],
    samsung: [
      "Abre «Galería» y entra en el álbum «Poda».",
      "Abre la imagen y toca los tres puntos de abajo a la derecha.",
      "Toca «Establecer como fondo» y elige pantalla de bloqueo, de inicio o las dos.",
    ],
    oppo: [
      "Abre «Fotos» y entra en el álbum «Poda».",
      "Abre la imagen y toca «Más».",
      "Toca «Establecer como fondo de pantalla» y elige pantalla de bloqueo, de inicio o las dos.",
    ],
    general: [
      "Abre la galería de fotos (Galería, Fotos o Google Fotos) y busca la carpeta «Poda».",
      "Abre la imagen y toca el menú (los tres puntos).",
      "Busca «Usar como» o «Establecer como fondo» y elige la pantalla.",
    ],
  },
  noAparece: "Si no la ves, espera unos minutos o búscala en la app «Archivos», en Imágenes › Poda.",
  borrar: "Si no la quieres, bórrala desde la galería como cualquier foto. Restaurar las apps no la borra.",
};
