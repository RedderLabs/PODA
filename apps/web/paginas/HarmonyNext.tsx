import Link from "next/link";
import { Cabecera, Pie } from "@/components/Logo";
import { rico } from "@/components/Rico";
import { ruta, textosDe, type Idioma } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

// Guía para Huawei con HarmonyOS NEXT (specs/003, fase A). Poda no se conecta a ellos: solo explica
// qué se puede quitar desde el propio móvil y cómo recuperarlo.

export const metaHarmonyNext = (idioma: Idioma) => {
  const t = textosDe(idioma).harmonyNext;
  return metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/harmonyos-next/" });
};

export function HarmonyNext({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma).harmonyNext;
  const r = (x: string) => rico(x, idioma);
  return (
    <>
      <Cabecera idioma={idioma} />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <p className="etiqueta">{t.etiqueta}</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          {r(t.titulo)}
        </h1>
        <p className="lead" style={{ maxWidth: 780 }}>
          {t.lead}
        </p>
        <p className="sub" style={{ maxWidth: 780, marginTop: 12 }}>
          {r(t.nota)}
        </p>

        <ol className="sinpc-pasos">
          {t.pasos.map((p, i) => (
            <li key={p.titulo} className="caja">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h2>{p.titulo}</h2>
              <p>{r(p.texto)}</p>
            </li>
          ))}
        </ol>

        <section className="sinpc-lista" aria-labelledby="no-quitar">
          <div className="seccion-cab" style={{ marginBottom: 24 }}>
            <h2 id="no-quitar" className="titulo t-l" style={{ margin: 0 }}>
              {r(t.noQuitarTitulo)}
            </h2>
            <p className="lead">{t.noQuitarLead}</p>
          </div>
          <ul className="rejilla r2" style={{ listStyle: "none", padding: 0 }}>
            {t.noQuitar.map((a) => (
              <li key={a.titulo} className="caja">
                <strong>{a.titulo}</strong>
                <p className="sub">{a.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="caja" style={{ marginTop: 40, maxWidth: 780 }} aria-labelledby="limites">
          <h2 id="limites">{t.limitesTitulo}</h2>
          <p>{t.limitesTexto}</p>
          <p className="sub">{t.comandosTexto}</p>
        </section>

        <div className="cta" style={{ marginTop: 56 }}>
          <h2 className="titulo" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, margin: 0 }}>
            {r(t.otrosTitulo)}
          </h2>
          <div className="acciones">
            <Link href={ruta(idioma, "/conectar/")} className="boton primario">
              {t.android}
            </Link>
            <Link href={ruta(idioma, "/marcas/")} className="boton oscuro">
              {t.marcas}
            </Link>
          </div>
        </div>
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
