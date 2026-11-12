// Imágenes para compartir (Open Graph / X): mismo estilo que la web. Se generan al compilar.
import { ImageResponse } from "next/og";

export const TAMANO_OG = { width: 1200, height: 630 };

const DEGRADADO = "linear-gradient(135deg, #FFC56E, #FF8A5B 55%, #FF6FA8)";

/** El logo de Poda (la cabeza del robot) dibujado con cajas. */
function Logo({ lado }: { lado: number }) {
  const u = lado / 64;
  return (
    <div style={{ width: lado, height: lado, borderRadius: 16 * u, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 44 * u, height: 44 * u, borderRadius: 10 * u, background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36 * u, height: 36 * u, borderRadius: 8 * u, background: "#141414", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 * u }}>
          <div style={{ width: 8 * u, height: 12 * u, borderRadius: 999, background: "#fff" }} />
          <div style={{ width: 8 * u, height: 12 * u, borderRadius: 999, background: "#fff" }} />
        </div>
      </div>
    </div>
  );
}

export function imagenOg({ etiqueta, titulo, resaltado, pie }: { etiqueta: string; titulo: string; resaltado?: string; pie: string }) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#efede7", padding: 72, color: "#141414" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Logo lado={64} />
          <div style={{ fontSize: 34, letterSpacing: 2 }}>PODA</div>
          <div style={{ marginLeft: "auto", fontSize: 22, color: "#6b675f", letterSpacing: 3, textTransform: "uppercase" }}>{etiqueta}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, lineHeight: 1.05, letterSpacing: -3 }}>
          <div style={{ display: "flex" }}>{titulo}</div>
          {resaltado && (
            <div style={{ display: "flex", marginTop: 10 }}>
              <div style={{ display: "flex", padding: "0 14px", border: "3px solid #FF8A5B", background: "#efede7" }}>{resaltado}</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, color: "#3f3c36" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#FF5A1F" }} />
          {pie}
        </div>
      </div>
    ),
    TAMANO_OG,
  );
}

export function iconoPng(lado: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#efede7" }}>
        <Logo lado={Math.round(lado * 0.82)} />
      </div>
    ),
    { width: lado, height: lado },
  );
}

// ------------------------------------------------------------------ imágenes de cada página e idioma
import { fmt, textosDe, type Idioma } from "./i18n";
import { marcaPorSlug, resumenDe } from "./marcas";

export function ogPortada(idioma: Idioma) {
  const t = textosDe(idioma).og;
  return imagenOg({ etiqueta: t.portadaEtiqueta, titulo: t.portadaTitulo, resaltado: t.portadaResaltado, pie: t.portadaPie });
}

export function ogMarca(idioma: Idioma, archivo: string) {
  const m = marcaPorSlug(archivo.replace(/\.png$/, ""));
  if (!m) return new Response("No existe", { status: 404 });
  const textos = textosDe(idioma);
  const r = resumenDe(m);
  const nombre = (textos.marcas.nombres as Record<string, string>)[m.slug] ?? m.nombre;
  return imagenOg({
    etiqueta: textos.og.marcaEtiqueta,
    titulo: nombre,
    resaltado: fmt(textos.og.marcaResaltado, { n: r.seguro }),
    pie: fmt(textos.og.marcaPie, { total: r.total }),
  });
}
