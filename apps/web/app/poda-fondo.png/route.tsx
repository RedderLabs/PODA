import { fondoPng } from "@/lib/og";

// Fondo de recuerdo (specs/010): se genera al compilar y la web lo copia al móvil si se pide.
export const dynamic = "force-static";

export function GET() {
  return fondoPng();
}
