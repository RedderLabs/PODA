import { Cabecera, Pie } from "@/components/Logo";
import { Conectar } from "@/components/Conectar";
import { GruposProtegidos } from "@/components/Protegidas";
import { rico } from "@/components/Rico";
import { textosDe, type Idioma } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

export const metaConectar = (idioma: Idioma) => {
  const t = textosDe(idioma).conectar;
  return metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/conectar/" });
};

export function PaginaConectar({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma).conectar;
  return (
    <>
      <Cabecera idioma={idioma} conNav={false} />
      <main className="herramienta">
        <Conectar />
        <section className="sinpc-lista" aria-labelledby="nunca-se-quitan" style={{ marginTop: 56 }}>
          <div className="seccion-cab" style={{ marginBottom: 24 }}>
            <h2 id="nunca-se-quitan" className="titulo t-l" style={{ margin: 0 }}>
              {rico(t.protegidasTitulo, idioma)}
            </h2>
            <p className="lead">{t.protegidasTexto}</p>
          </div>
          <div className="rejilla r2">
            <GruposProtegidos idioma={idioma} />
          </div>
        </section>
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
