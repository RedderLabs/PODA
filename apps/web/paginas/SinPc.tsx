import Link from "next/link";
import { AVISO_PODA, PROTEGIDOS, TEXTOS_NUCLEO } from "@poda/nucleo";
import { Cabecera, Pie } from "@/components/Logo";
import { rico } from "@/components/Rico";
import { ruta, textosDe, type Idioma } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

export const metaSinPc = (idioma: Idioma) => {
  const t = textosDe(idioma).sinPc;
  return metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/sin-pc/" });
};

export function SinPc({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma).sinPc;
  const n = TEXTOS_NUCLEO[idioma];
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
            <p className="lead">{r(t.noQuitarLead)}</p>
          </div>

          <div className="rejilla r2">
            {PROTEGIDOS.map((g, i) => (
              <details key={g.titulo} className="caja protegidos">
                <summary>
                  <span>
                    <strong>{n.protegidos[i].titulo}</strong>
                    <span className="sub">{n.protegidos[i].motivo}</span>
                  </span>
                  <span className="mono protegidos-n">{g.paquetes.length + (g.familias?.length ?? 0)}</span>
                </summary>
                <ul>
                  {g.paquetes.map((p) => (
                    <li key={p}>
                      <code>{p}</code>
                    </li>
                  ))}
                  {g.familias?.map((f, j) => (
                    <li key={f.texto} className="familia">
                      {n.protegidos[i].familias?.[j] ?? f.texto}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <details className="caja protegidos con-cuidado">
              <summary>
                <span>
                  <strong>{t.cuidadoTitulo}</strong>
                  <span className="sub">{t.cuidadoMotivo}</span>
                </span>
                <span className="mono protegidos-n">{Object.keys(AVISO_PODA).length}</span>
              </summary>
              <ul>
                {Object.keys(AVISO_PODA).map((p) => (
                  <li key={p}>
                    <code>{p}</code>
                    <span className="sub">{n.avisoPoda[p]}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </section>

        <div className="cta" style={{ marginTop: 56 }}>
          <h2 className="titulo" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, margin: 0 }}>
            {r(t.logoTitulo)}
          </h2>
          <div className="acciones">
            <Link href={ruta(idioma, "/rescate/")} className="boton primario">
              {t.recuperar}
            </Link>
            <Link href={ruta(idioma, "/conectar/")} className="boton oscuro">
              {t.conCable}
            </Link>
          </div>
        </div>
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
