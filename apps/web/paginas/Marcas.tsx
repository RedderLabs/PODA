import Link from "next/link";
import { notFound } from "next/navigation";
import { NIVELES, paquetesDeFabricante, TEXTOS_NUCLEO } from "@poda/nucleo";
import { Cabecera, Pie } from "@/components/Logo";
import { JsonLd } from "@/components/JsonLd";
import { rico } from "@/components/Rico";
import { fmt, ruta, textosDe, type Idioma, type Textos } from "@/lib/i18n";
import { MARCAS, marcaPorSlug, prefijos, resumenDe, uad, type Marca } from "@/lib/marcas";
import { metaPagina, migas } from "@/lib/seo";

/** Nombre de la marca en un idioma («Xiaomi, Redmi y POCO» / «Xiaomi, Redmi and POCO»). */
export const nombreMarca = (m: Marca, t: Textos) => (t.marcas.nombres as Record<string, string>)[m.slug] ?? m.nombre;
/** Primera marca del nombre, para «Analizar mi Xiaomi». */
const nombreCorto = (nombre: string) => nombre.split(/,|\s(?:y|e|and|et|i)\s/)[0].trim();

// ------------------------------------------------------------------ /marcas/
export const metaMarcas = (idioma: Idioma) => {
  const t = textosDe(idioma).marcas;
  return metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/marcas/" });
};

export function Marcas({ idioma }: { idioma: Idioma }) {
  const textos = textosDe(idioma);
  const t = textos.marcas;
  const filas = MARCAS.map((m) => ({ m, r: resumenDe(m) })).sort((a, b) => b.r.total - a.r.total);
  return (
    <>
      <Cabecera idioma={idioma} />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <p className="etiqueta">{t.etiqueta}</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          {rico(t.titulo, idioma)}
        </h1>
        <p className="lead" style={{ maxWidth: 720, marginBottom: 32 }}>
          {t.lead}
        </p>
        <div className="envoltura-tabla">
          <table className="tabla-marcas">
            <thead>
              <tr>
                <th scope="col">{t.columnas.fabricante}</th>
                <th scope="col" className="n">
                  {t.columnas.conocidas}
                </th>
                <th scope="col" className="n">
                  {t.columnas.seguras}
                </th>
                <th scope="col" className="n">
                  {t.columnas.avanzadas}
                </th>
                <th scope="col" className="n">
                  {t.columnas.expertos}
                </th>
                <th scope="col" className="n">
                  {t.columnas.imprescindibles}
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ m, r }) => (
                <tr key={m.slug}>
                  <td>
                    <Link href={ruta(idioma, `/marcas/${m.slug}/`)}>{nombreMarca(m, textos)}</Link>
                  </td>
                  <td className="n">{r.total}</td>
                  <td className="n">{r.seguro}</td>
                  <td className="n">{r.avanzado}</td>
                  <td className="n">{r.experto}</td>
                  <td className="n">{r.bloqueado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Pie idioma={idioma} />
    </>
  );
}

// ------------------------------------------------------------------ /marcas/[marca]/
export function metaMarca(idioma: Idioma, slug: string) {
  const m = marcaPorSlug(slug);
  if (!m) return {};
  const textos = textosDe(idioma);
  const t = textos.marcas;
  const r = resumenDe(m);
  const datos = { ...r, marca: nombreMarca(m, textos) };
  return metaPagina({
    idioma,
    titulo: fmt(t.marcaMetaTitulo, datos),
    descripcion: fmt(t.marcaMetaDescripcion, datos),
    r: `/marcas/${m.slug}/`,
    imagen: { url: ruta(idioma, `/og/marca/${m.slug}.png`), width: 1200, height: 630, alt: fmt(t.marcaImagenAlt, datos) },
  });
}

export function PaginaMarca({ idioma, slug }: { idioma: Idioma; slug: string }) {
  const m = marcaPorSlug(slug);
  if (!m) notFound();
  const textos = textosDe(idioma);
  const t = textos.marcas;
  const r = resumenDe(m);
  const nombre = nombreMarca(m, textos);
  const datos = { ...r, marca: nombre };
  const paquetes = paquetesDeFabricante(uad(), prefijos(m));

  return (
    <>
      <Cabecera idioma={idioma} />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <JsonLd
          datos={migas([
            { nombre: "Poda", ruta: ruta(idioma, "/") },
            { nombre: t.migaMarcas, ruta: ruta(idioma, "/marcas/") },
            { nombre, ruta: ruta(idioma, `/marcas/${m.slug}/`) },
          ])}
        />
        <p className="migas">
          <Link href={ruta(idioma, "/marcas/")}>{t.migaMarcas}</Link> / {nombre}
        </p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          {rico(fmt(t.marcaTitulo, datos), idioma)}
        </h1>
        <p className="lead" style={{ maxWidth: 760 }}>
          {fmt(t.marcaLead, datos)}
        </p>
        <div className="acciones" style={{ marginTop: 24 }}>
          <Link href={ruta(idioma, "/conectar/")} className="boton primario">
            {fmt(t.analizar, { marca: nombreCorto(nombre) })}
          </Link>
        </div>

        {NIVELES.map((n) => {
          const deNivel = paquetes.filter((p) => p.nivel === n);
          if (!deNivel.length) return null;
          return (
            <section className="bloque-nivel" key={n} aria-labelledby={`n-${n}`}>
              <h2 id={`n-${n}`}>
                {t.tituloNivel[n]} <span className="mono" style={{ fontSize: 14, color: "var(--gris)" }}>({deNivel.length})</span>
              </h2>
              <p className="sub">
                {TEXTOS_NUCLEO[idioma].nivel[n]} {t.descripcionesIngles}
              </p>
              <ul className="paquetes">
                {deNivel.map((p) => (
                  <li key={p.paquete}>
                    <code>{p.paquete}</code>
                    <span>{p.descripcion || t.sinDescripcion}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
