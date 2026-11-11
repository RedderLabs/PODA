import Link from "next/link";
import { Pie } from "@/components/Logo";
import { Portada } from "@/components/Portada";
import { CopiarPrompt } from "@/components/CopiarPrompt";
import { LO_QUE_NO, LO_QUE_SI, PASOS, PERFILES_LANDING, PREGUNTAS, PROMPT_CLAUDE } from "@/lib/contenido";
import { JsonLd } from "@/components/JsonLd";
import { ACRONIMO, DESCRIPCION, NOMBRE, ORGANIZACION, REPO, URL_BASE } from "@/lib/seo";

const DATOS = {
  "@context": "https://schema.org",
  "@graph": [
    { ...ORGANIZACION, "@id": "https://redderlabs.com/#org" },
    {
      "@type": "WebSite",
      "@id": `${URL_BASE}/#web`,
      url: `${URL_BASE}/`,
      name: NOMBRE,
      inLanguage: "es",
      publisher: { "@id": "https://redderlabs.com/#org" },
    },
    {
      "@type": "WebApplication",
      name: NOMBRE,
      alternateName: `PODA (${ACRONIMO})`,
      url: `${URL_BASE}/conectar/`,
      description: DESCRIPCION,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Android (desde un navegador Chromium de escritorio)",
      browserRequirements: "Requiere WebUSB: Chrome, Edge, Brave u Opera de escritorio",
      inLanguage: "es",
      isAccessibleForFree: true,
      license: "https://www.gnu.org/licenses/gpl-3.0.html",
      sameAs: [REPO],
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      publisher: { "@id": "https://redderlabs.com/#org" },
    },
    {
      "@type": "FAQPage",
      mainEntity: PREGUNTAS.map((p) => ({ "@type": "Question", name: p.pregunta, acceptedAnswer: { "@type": "Answer", text: p.respuesta } })),
    },
  ],
};

export default function Inicio() {
  return (
    <>
      <JsonLd datos={DATOS} />
      <Portada />
      <main>


        <section id="como" className="contenedor seccion borde">
          <div className="seccion-cab">
            <h2 className="titulo t-l">
              Cuatro pasos.
              <br />
              <em>Cero instalaciones.</em>
            </h2>
            <p className="lead">Chrome o Edge hablan directamente con tu móvil por el cable USB (WebUSB). Nada sale de tu ordenador.</p>
          </div>
          <div className="rejilla r4">
            {PASOS.map((p) => (
              <div className="caja" key={p.n} style={{ minHeight: 190 }}>
                <span className="num">{p.n}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="perfiles" className="oscura">
          <div className="contenedor seccion">
            <p className="etiqueta" style={{ marginBottom: 14 }}>
              Perfiles por marca y modelo
            </p>
            <h2 className="titulo t-l" style={{ marginBottom: 40 }}>
              Tú decides <em>hasta dónde.</em>
            </h2>
            <div className="rejilla r3">
              {PERFILES_LANDING.map((r) => (
                <div className="caja-oscura" key={r.nombre}>
                  <div className="cab">
                    <h3>{r.nombre}</h3>
                    <span className="chip">{r.etiqueta}</span>
                  </div>
                  <p>{r.texto}</p>
                  <p className="ej">{r.ejemplo}</p>
                </div>
              ))}
            </div>
            <div className="nota-ia">
              <span className="mono">IA · cada paquete</span>
              <p>
                <span className="mono" style={{ fontSize: 13, color: "#a7a196" }}>
                  com.miui.msa.global
                </span>{" "}
                — Es el sistema de anuncios de Xiaomi. Quitarlo elimina la publicidad en apps del sistema y no rompe nada.
              </p>
            </div>
          </div>
        </section>

        <section id="claude" className="contenedor seccion">
          <div className="claude">
            <div>
              <p className="etiqueta">Otra vía · sin cable</p>
              <h2 className="titulo t-l">
                ¿Usas Claude?
                <br />
                <em>Pégale esto.</em>
              </h2>
              <p className="lead" style={{ fontSize: 15 }}>
                Si tienes Claude Code u otro asistente de código, puede hacerlo por Wi‑Fi. Usa las mismas listas que la web, y si tu modelo no
                está en ellas lo investiga contigo.
              </p>
              <ol>
                <li>Activa la depuración inalámbrica (Android 11 o superior).</li>
                <li>Pega el prompt en tu asistente.</li>
                <li>Acepta el emparejamiento en el móvil y revisa la propuesta.</li>
              </ol>
            </div>
            <div className="terminal">
              <div className="cab">
                <span>PROMPT.md</span>
                <CopiarPrompt texto={PROMPT_CLAUDE} />
              </div>
              <pre>{PROMPT_CLAUDE}</pre>
            </div>
          </div>
        </section>

        <section id="honesto" className="contenedor seccion">
          <h2 className="titulo t-l" style={{ marginBottom: 40 }}>
            Sin humo: <em>qué hace y qué no.</em>
          </h2>
          <div className="rejilla r2">
            <div className="caja">
              <h3 style={{ fontSize: 16 }}>Lo que sí</h3>
              <ul className="lista-si-no">
                {LO_QUE_SI.map((t) => (
                  <li key={t}>
                    <span className="m" aria-hidden="true">+</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="caja gris">
              <h3 style={{ fontSize: 16 }}>Lo que no</h3>
              <ul className="lista-si-no">
                {LO_QUE_NO.map((t) => (
                  <li key={t}>
                    <span className="m" aria-hidden="true">−</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="contenedor seccion faq">
          <h2 className="titulo t-l" style={{ marginBottom: 28 }}>
            Preguntas
          </h2>
          <div>
            {PREGUNTAS.map((f) => (
              <details key={f.pregunta}>
                <summary>{f.pregunta}</summary>
                <p>
                  {f.respuesta}
                  {"enlace" in f && f.enlace && (
                    <>
                      {" "}
                      <Link href={f.enlace.href} className="faq-enlace">
                        {f.enlace.texto} →
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
              Enchufa.
              <br />
              <em>Poda. Listo.</em>
            </h2>
            <div className="acciones">
              <Link href="/conectar/" className="boton primario">
                Conectar mi móvil
              </Link>
              <Link href="/marcas/" className="boton oscuro">
                Ver por marca
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Pie />
    </>
  );
}
