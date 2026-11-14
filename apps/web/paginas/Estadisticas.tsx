import { Cabecera, Pie } from "@/components/Logo";
import { textosDe, type Idioma } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

/** Panel público de Umami: solo cuenta visitas a páginas, nada del móvil. Ver components/Estadisticas.tsx. */
export const PANEL_UMAMI = "https://cloud.umami.is/share/WcTd6uyYsdu0NAz2";

export const metaEstadisticas = (idioma: Idioma) => {
  const t = textosDe(idioma).estadisticas;
  return { ...metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/estadisticas/" }), robots: { index: false } };
};

export function Estadisticas({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma).estadisticas;
  return (
    <>
      <Cabecera idioma={idioma} />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <p className="etiqueta">{t.etiqueta}</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          {t.titulo}
        </h1>
        <p className="lead" style={{ maxWidth: 780 }}>
          {t.lead}
        </p>
        <p className="sub" style={{ maxWidth: 780, marginTop: 12 }}>
          <a href={PANEL_UMAMI} target="_blank" rel="noopener noreferrer">
            {t.abrir}
          </a>
        </p>
        <iframe
          src={PANEL_UMAMI}
          title={t.titulo}
          loading="lazy"
          style={{ display: "block", width: "100%", height: 1600, marginTop: 32, border: "1px solid var(--linea)", borderRadius: 12 }}
        />
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
