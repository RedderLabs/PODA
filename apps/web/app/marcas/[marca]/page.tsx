import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DESCRIPCION_NIVEL, NIVELES, paquetesDeFabricante, type Nivel } from "@poda/nucleo";
import { Cabecera, Pie } from "@/components/Logo";
import { MARCAS, marcaPorSlug, prefijos, resumenDe, uad } from "@/lib/marcas";
import { metaPagina, migas } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";

type Params = { marca: string };

export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return MARCAS.map((m) => ({ marca: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const m = marcaPorSlug((await params).marca);
  if (!m) return {};
  const r = resumenDe(m);
  return metaPagina({
    titulo: `Quitar bloatware de ${m.nombre} sin root`,
    descripcion: `${r.total} apps de serie de ${m.nombre} y cuáles se pueden quitar sin riesgo: ${r.seguro} seguras, ${r.avanzado} avanzadas y ${r.experto} para expertos. Con vuelta atrás.`,
    ruta: `/marcas/${m.slug}/`,
    imagen: { url: `/og/marca/${m.slug}.png`, width: 1200, height: 630, alt: `${m.nombre}: ${r.seguro} apps de serie se pueden quitar sin riesgo` },
  });
}

const TITULO_NIVEL: Record<Nivel, string> = {
  seguro: "Seguras de quitar",
  avanzado: "Avanzadas",
  experto: "Solo para expertos",
  bloqueado: "Imprescindibles: no se tocan",
};

export default async function PaginaMarca({ params }: { params: Promise<Params> }) {
  const m = marcaPorSlug((await params).marca);
  if (!m) notFound();
  const r = resumenDe(m);
  const paquetes = paquetesDeFabricante(uad(), prefijos(m));

  return (
    <>
      <Cabecera />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <JsonLd
          datos={migas([
            { nombre: "Poda", ruta: "/" },
            { nombre: "Marcas", ruta: "/marcas/" },
            { nombre: m.nombre, ruta: `/marcas/${m.slug}/` },
          ])}
        />
        <p className="migas">
          <Link href="/marcas/">Marcas</Link> / {m.nombre}
        </p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          Bloatware de {m.nombre}: <em>qué se puede quitar.</em>
        </h1>
        <p className="lead" style={{ maxWidth: 760 }}>
          Poda conoce {r.total} apps propias de {m.nombre}: {r.seguro} se pueden quitar sin riesgo, {r.avanzado} son servicios que quizá no uses,{" "}
          {r.experto} solo para expertos y {r.bloqueado} imprescindibles que nunca se tocan. Todo sin root y con vuelta atrás.
        </p>
        <div className="acciones" style={{ marginTop: 24 }}>
          <Link href="/conectar/" className="boton primario">
            Analizar mi {m.nombre.split(",")[0].split(" y ")[0]}
          </Link>
        </div>

        {NIVELES.map((n) => {
          const deNivel = paquetes.filter((p) => p.nivel === n);
          if (!deNivel.length) return null;
          return (
            <section className="bloque-nivel" key={n} aria-labelledby={`n-${n}`}>
              <h2 id={`n-${n}`}>
                {TITULO_NIVEL[n]} <span className="mono" style={{ fontSize: 14, color: "var(--gris)" }}>({deNivel.length})</span>
              </h2>
              <p className="sub">{DESCRIPCION_NIVEL[n]} Descripciones originales en inglés de la lista de UAD‑ng.</p>
              <ul className="paquetes">
                {deNivel.map((p) => (
                  <li key={p.paquete}>
                    <code>{p.paquete}</code>
                    <span>{p.descripcion || "Sin descripción."}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </main>
      <Pie />
    </>
  );
}
