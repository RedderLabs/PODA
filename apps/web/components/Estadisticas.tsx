// Recuento de visitas con Umami: sin cookies y sin datos personales. Solo cuenta qué página se abre.
// Apagado si no se define NEXT_PUBLIC_UMAMI_ID al compilar. Nunca se le mandan eventos con datos del
// móvil (modelo, lista de apps…): eso no sale del ordenador del usuario. Ver AGENTS.md.
const ID = process.env.NEXT_PUBLIC_UMAMI_ID;
const SRC = process.env.NEXT_PUBLIC_UMAMI_SRC ?? "https://cloud.umami.is/script.js";
const DOMINIOS = process.env.NEXT_PUBLIC_UMAMI_DOMINIOS ?? "podamovil.com";

export function Estadisticas() {
  if (!ID) return null;
  return (
    <script
      defer
      src={SRC}
      data-website-id={ID}
      data-domains={DOMINIOS}
      data-do-not-track="true"
      data-exclude-search="true"
      data-exclude-hash="true"
    />
  );
}
