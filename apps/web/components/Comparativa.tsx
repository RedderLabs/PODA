"use client";
// Antes y después (specs/009): la copia guardada antes de tocar nada frente a lo que Poda acaba de leer del móvil.
import { useMemo } from "react";
import { compararConCopia, type Comparativa as Datos, type CopiaEstado, type EstadoPaquete } from "@poda/nucleo";
import { fmt } from "@/lib/rutas";
import { useTextos } from "./Textos";

const ESTADOS: EstadoPaquete[] = ["instalado", "desactivado", "quitado"];

/** Con `copia` y `ahora` la calcula; con `datos` enseña una ya calculada (la de después de reiniciar). */
export function Comparativa(p: { copia: CopiaEstado; ahora: Map<string, EstadoPaquete> } | { datos: Datos }) {
  const { idioma, t: textos } = useTextos();
  const t = textos.podar;
  const estadoApp = textos.conectar.estadoApp;
  const datos = useMemo(() => ("datos" in p ? p.datos : compararConCopia(p.copia, p.ahora)), [p]);
  const fecha = new Date(datos.creada).toLocaleString(textos.idioma.fecha, { dateStyle: "short", timeStyle: "short" });
  const n = datos.cambios.length;

  return (
    <section className="comparativa" aria-label={t.compTitulo}>
      <h2>{t.compTitulo}</h2>
      <p className="sub">{fmt(t.compTexto, { fecha }, idioma)}</p>
      <table>
        <thead>
          <tr>
            <th scope="col">{t.compApps}</th>
            <th scope="col">{t.compCopia}</th>
            <th scope="col">{t.compAhora}</th>
          </tr>
        </thead>
        <tbody>
          {ESTADOS.map((e) => (
            <tr key={e} className={datos.antes[e] !== datos.ahora[e] ? "cambia" : ""}>
              <th scope="row">{t.compFilas[e]}</th>
              <td>{datos.antes[e]}</td>
              <td>{datos.ahora[e]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {n === 0 ? (
        <p className="sub">{t.compSinCambios}</p>
      ) : (
        <details>
          <summary>{fmt(t.compVer, { n }, idioma)}</summary>
          <ul className="comparativa-apps">
            {datos.cambios.map((c) => (
              <li key={c.paquete}>
                <code>{c.paquete}</code>
                <span>
                  {estadoApp[c.antes]} → <strong>{estadoApp[c.ahora]}</strong>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="sub">{t.compMovil}</p>
    </section>
  );
}
