"use client";
// Lo que Poda ha comprobado al volver del reinicio (specs/008). Solo enseña: no cambia nada del móvil.
import { todoEnOrden, type ComprobacionReinicio } from "@poda/nucleo";
import { fmt } from "@/lib/rutas";
import { rico } from "./Rico";
import { useTextos } from "./Textos";
import { Comparativa } from "./Comparativa";

type Marca = "bien" | "mal" | "duda";

export function TrasReinicio({ c, podar }: { c: ComprobacionReinicio | "comprobando"; podar: (inicio: "perfil" | "restaurar") => void }) {
  const { idioma, t: textos } = useTextos();
  const t = textos.conectar;

  if (c === "comprobando") {
    return (
      <p className="tras-reinicio-espera" role="status">
        {t.comprobando}
      </p>
    );
  }

  const enOrden = todoEnOrden(c);
  const n = c.siguen.length + c.cambiaron.length;
  const sinComprobar = (que: string) => fmt(t.sinComprobar, { que }, idioma);
  const filas: [Marca, string][] = [
    c.arranco ? ["bien", t.arrancoBien] : ["mal", t.noArranco],
    c.inicio === null ? ["duda", sinComprobar(t.queInicio)] : c.inicio ? ["bien", t.inicioBien] : ["mal", t.inicioMal],
    c.teclado === null ? ["duda", sinComprobar(t.queTeclado)] : c.teclado ? ["bien", t.tecladoBien] : ["mal", t.tecladoMal],
    c.protegidasAfectadas.length ? ["mal", fmt(t.protegidasMal, { n: c.protegidasAfectadas.length }, idioma)] : ["bien", t.protegidasBien],
  ];
  if (n > 0) {
    filas.push(c.cambiaron.length ? ["mal", fmt(t.appsMal, { n: c.cambiaron.length }, idioma)] : ["bien", fmt(t.appsBien, { n }, idioma)]);
  }
  const volvieron = c.cambiaron.some((x) => x.esperado !== "instalado");

  return (
    <section className={"tras-reinicio" + (enOrden ? " bien" : " mal")} role="status" aria-live="polite">
      <h2>{t.trasTitulo}</h2>
      {enOrden && <p className="tras-resumen">{n > 0 ? fmt(t.todoBien, { n }, idioma) : t.todoBienSinApps}</p>}
      <ul className="tras-lista">
        {filas.map(([marca, texto]) => (
          <li key={texto} className={marca}>
            {rico(texto, idioma)}
          </li>
        ))}
      </ul>
      {c.protegidasAfectadas.length > 0 && (
        <ul className="tras-apps">
          {c.protegidasAfectadas.map((p) => (
            <li key={p} className="mono">
              {p}
            </li>
          ))}
        </ul>
      )}
      {c.cambiaron.length > 0 && (
        <ul className="tras-apps">
          {c.cambiaron.map((x) => (
            <li key={x.paquete}>
              <span className="mono">{x.paquete}</span>
              <span className="sub">{fmt(t.appCambio, { antes: t.estadoApp[x.esperado], ahora: t.estadoApp[x.ahora] }, idioma)}</span>
            </li>
          ))}
        </ul>
      )}
      {volvieron && <p className="sub">{t.volvieron}</p>}
      {c.comparativa && <Comparativa datos={c.comparativa} />}
      <p className="sub">{t.llamada}</p>
      {(volvieron || c.protegidasAfectadas.length > 0 || c.inicio === false || c.teclado === false) && (
        <div className="acciones">
          {volvieron && (
            <button type="button" className="boton primario" onClick={() => podar("perfil")}>
              {t.volverAElegir}
            </button>
          )}
          <button type="button" className={"boton" + (volvieron ? "" : " primario")} onClick={() => podar("restaurar")}>
            {t.restaurarCopia}
          </button>
        </div>
      )}
    </section>
  );
}
