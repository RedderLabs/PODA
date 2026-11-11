// Imagen para compartir la portada. Es una ruta con extensión .png para que la web estática la sirva
// como imagen en cualquier alojamiento (los nombres sin extensión se sirven como binario genérico).
import { imagenOg } from "@/lib/og";

export const dynamic = "force-static";

export function GET() {
  return imagenOg({
    etiqueta: "Android · sin root",
    titulo: "Tu móvil,",
    resaltado: "sin relleno.",
    pie: "Quita las apps de serie desde el navegador. Con vuelta atrás.",
  });
}
