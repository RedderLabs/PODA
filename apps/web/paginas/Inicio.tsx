import Link from "next/link";
import { Pie } from "@/components/Logo";
import { Portada } from "@/components/Portada";
import { CopiarPrompt } from "@/components/CopiarPrompt";
import { JsonLd } from "@/components/JsonLd";
import { rico } from "@/components/Rico";
import { ruta, textosDe, type Idioma } from "@/lib/i18n";
import { NOMBRE, ORGANIZACION, REPO, URL_BASE } from "@/lib/seo";

function datos(idioma: Idioma) {
  const t = textosDe(idioma);
  const acronimo = t.pie.acronimo.replace(/\*\*/g, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      { ...ORGANIZACION, "@id": "https://redderlabs.com/#org" },
      {
        "@type": "WebSite",
        "@id": `${URL_BASE}/#web`,
        url: `${URL_BASE}${ruta(idioma, "/")}`,
        name: NOMBRE,
        inLanguage: idioma,
        publisher: { "@id": "https://redderlabs.com/#org" },
      },
      {
        "@type": "WebApplication",
        name: NOMBRE,
        alternateName: `PODA (${acronimo})`,
        url: `${URL_BASE}${ruta(idioma, "/conectar/")}`,
        description: t.seo.descripcion,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: t.seo.sistemaApp,
        browserRequirements: t.seo.requisitosApp,
        inLanguage: idioma,
        isAccessibleForFree: true,
        license: "https://www.gnu.org/licenses/gpl-3.0.html",
        sameAs: [REPO],
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        publisher: { "@id": "https://redderlabs.com/#org" },
      },
      {
        "@type": "FAQPage",
        mainEntity: t.inicio.preguntas.map((p) => ({ "@type": "Question", name: p.pregunta, acceptedAnswer: { "@type": "Answer", text: p.respuesta } })),
      },
    ],
  };
}

export function Inicio({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma).inicio;
  const r = (texto: string) => rico(texto, idioma);
  return (
    <>
      <JsonLd datos={datos(idioma)} />
      <Portada />
      <main>
        <section id="como" className="contenedor seccion borde">
          <div className="seccion-cab">
            <h2 className="titulo t-l">{r(t.comoTitulo)}</h2>
            <p className="lead">{t.comoLead}</p>
          </div>
          <div className="rejilla r4">
            {t.pasos.map((p, i) => (
              <div className="caja" key={p.titulo} style={{ minHeight: 190 }}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="perfiles" className="oscura">
          <div className="contenedor seccion">
            <p className="etiqueta" style={{ marginBottom: 14 }}>
              {t.perfilesEtiqueta}
            </p>
            <h2 className="titulo t-l" style={{ marginBottom: 40 }}>
              {r(t.perfilesTitulo)}
            </h2>
            <div className="rejilla r3">
              {t.perfiles.map((p) => (
                <div className="caja-oscura" key={p.nombre}>
                  <div className="cab">
                    <h3>{p.nombre}</h3>
                    <span className="chip">{p.etiqueta}</span>
                  </div>
                  <p>{p.texto}</p>
                  <p className="ej">{p.ejemplo}</p>
                </div>
              ))}
            </div>
            <div className="nota-ia">
              <span className="mono">{t.iaEtiqueta}</span>
              <p>
                <span className="mono" style={{ fontSize: 13, color: "#a7a196" }}>
                  com.miui.msa.global
                </span>{" "}
                — {t.iaEjemplo}
              </p>
            </div>
          </div>
        </section>

        <section id="claude" className="contenedor seccion">
          <div className="claude">
            <div>
              <p className="etiqueta">{t.claudeEtiqueta}</p>
              <h2 className="titulo t-l">{r(t.claudeTitulo)}</h2>
              <p className="lead" style={{ fontSize: 15 }}>
                {t.claudeLead}
              </p>
              <ol>
                {t.claudePasos.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ol>
            </div>
            <div className="terminal">
              <div className="cab">
                <span>PROMPT.md</span>
                <CopiarPrompt texto={t.prompt} />
              </div>
              <pre>{t.prompt}</pre>
            </div>
          </div>
        </section>

        <section id="honesto" className="contenedor seccion">
          <h2 className="titulo t-l" style={{ marginBottom: 40 }}>
            {r(t.honestoTitulo)}
          </h2>
          <div className="rejilla r2">
            <div className="caja">
              <h3 style={{ fontSize: 16 }}>{t.si}</h3>
              <ul className="lista-si-no">
                {t.loQueSi.map((x) => (
                  <li key={x}>
                    <span className="m" aria-hidden="true">
                      +
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="caja gris">
              <h3 style={{ fontSize: 16 }}>{t.no}</h3>
              <ul className="lista-si-no">
                {t.loQueNo.map((x) => (
                  <li key={x}>
                    <span className="m" aria-hidden="true">
                      −
                    </span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="contenedor seccion faq">
          <h2 className="titulo t-l" style={{ marginBottom: 28 }}>
            {t.preguntasTitulo}
          </h2>
          <div>
            {t.preguntas.map((f) => (
              <details key={f.pregunta}>
                <summary>{f.pregunta}</summary>
                <p>
                  {f.respuesta}
                  {"enlace" in f && f.enlace && (
                    <>
                      {" "}
                      <Link href={ruta(idioma, "/sin-pc/")} className="faq-enlace">
                        {f.enlace} →
                      </Link>
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="contenedor" style={{ marginBottom: 40 }}>
          <div className="cta">
            <h2 className="titulo" style={{ fontSize: "clamp(44px, 6vw, 60px)", lineHeight: 0.98 }}>
              {r(t.ctaTitulo)}
            </h2>
            <div className="acciones">
              <Link href={ruta(idioma, "/conectar/")} className="boton primario">
                {t.ctaConectar}
              </Link>
              <Link href={ruta(idioma, "/marcas/")} className="boton oscuro">
                {t.ctaMarcas}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
