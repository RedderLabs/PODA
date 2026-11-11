import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, Pie } from "@/components/Logo";
import { MARCAS, resumenDe } from "@/lib/marcas";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Bloatware por marca: qué apps de serie se pueden quitar",
  descripcion: "Lista de apps preinstaladas que se pueden quitar sin root en Samsung, Xiaomi, OPPO, realme, Huawei, Motorola, Pixel y más, con su nivel de riesgo.",
  ruta: "/marcas/",
});

export default function Marcas() {
  const filas = MARCAS.map((m) => ({ m, r: resumenDe(m) })).sort((a, b) => b.r.total - a.r.total);
  return (
    <>
      <Cabecera />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <p className="etiqueta">Bloatware por marca</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          ¿Qué trae <em>tu móvil de serie?</em>
        </h1>
        <p className="lead" style={{ maxWidth: 720, marginBottom: 32 }}>
          Apps propias de cada fabricante que Poda conoce y su nivel de riesgo. A esto se suman, en cualquier marca, las de operadoras, Google y
          terceros como Facebook o Netflix.
        </p>
        <div className="envoltura-tabla">
          <table className="tabla-marcas">
            <thead>
              <tr>
                <th scope="col">Fabricante</th>
                <th scope="col" className="n">Conocidas</th>
                <th scope="col" className="n">Seguras</th>
                <th scope="col" className="n">Avanzadas</th>
                <th scope="col" className="n">Expertos</th>
                <th scope="col" className="n">Imprescindibles</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ m, r }) => (
                <tr key={m.slug}>
                  <td>
                    <Link href={`/marcas/${m.slug}/`}>{m.nombre}</Link>
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
      <Pie />
    </>
  );
}
