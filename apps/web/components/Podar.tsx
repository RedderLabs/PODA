"use client";
// Paso 2: elegir perfil, revisar, hacer copia y aplicar. Y deshacer desde una copia.
// Reglas que no se saltan: solo paquetes de la lista, nunca «bloqueado», copia antes de cambiar nada
// y confirmación explícita.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AVISO_PODA,
  COMANDO_CON_ICONO,
  COMANDOS,
  comandoVerificarBloqueo,
  crearCopiaEstado,
  DESCRIPCION_NIVEL,
  esCredencialValida,
  estadosDe,
  leerCopiaEstado,
  leerRespuestaBloqueo,
  paquetesConIcono,
  paquetesDe,
  pasosParaRestaurar,
  planDePerfil,
  RESPUESTA_OK,
  tamanoPerfiles,
  type CopiaEstado,
  type EstadoPaquete,
  type Ficha,
  type ItemPlan,
  type ListaCompacta,
  type Perfil,
  type PasoRestaurar,
} from "@poda/nucleo";
import type { Movil } from "@/lib/conexion";
import { cargarDetalles, cargarLista, copiasGuardadas, descargarCopia, guardarCopiaLocal, type Detalles } from "@/lib/datos";

type Modo = "quitar" | "desactivar";
type Resultado = { paquete: string; ok: boolean; texto: string; saltada?: boolean };

type Paso =
  | { t: "leyendo" }
  | { t: "elegir" }
  | { t: "confirmar" }
  | { t: "aplicando"; hechos: Resultado[]; total: number; actual: string }
  | { t: "hecho"; resultados: Resultado[]; copia: CopiaEstado; copiaLocal: boolean; detenido: boolean }
  | { t: "restaurar" }
  | { t: "restaurar-confirmar"; copia: CopiaEstado; pasos: PasoRestaurar[] }
  | { t: "restaurando"; hechos: Resultado[]; total: number; actual: string }
  | { t: "restaurado"; resultados: Resultado[] }
  | { t: "error"; mensaje: string };

const PERFIL_INFO: Record<Perfil, { nombre: string; etiqueta: string; texto: string }> = {
  seguro: { nombre: "Seguro", etiqueta: "para todos", texto: "Publicidad, analítica y apps duplicadas. Nada que afecte al sistema." },
  recomendado: { nombre: "Recomendado", etiqueta: "por defecto", texto: "Lo anterior más servicios del fabricante y la operadora que casi nadie usa." },
  experto: { nombre: "Experto", etiqueta: "con avisos", texto: "Todo lo que se puede quitar sin root. Puede afectar a funciones del sistema." },
};
const NOMBRE_GRUPO = { seguro: "Seguras", avanzado: "Avanzadas", experto: "Para expertos" } as const;

async function leerEstados(movil: Movil) {
  const [todos, presentes, desactivados] = await Promise.all([
    movil.shell(["pm", "list", "packages", "-u", "--user", "0"]),
    movil.shell(["pm", "list", "packages", "--user", "0"]),
    movil.shell(["pm", "list", "packages", "-d", "--user", "0"]),
  ]);
  return estadosDe(paquetesDe(todos), paquetesDe(presentes), paquetesDe(desactivados));
}

/** Apps con icono en el cajón: se marcan igual, pero se señalan por si el usuario las usa. */
async function leerConIcono(movil: Movil): Promise<Set<string>> {
  try {
    return paquetesConIcono(await movil.shell(COMANDO_CON_ICONO));
  } catch {
    return new Set();
  }
}

/** Máximo de intentos de PIN: cada fallo cuenta en el móvil y no queremos que se bloquee. */
const MAX_FALLOS_PIN = 3;

export function Podar({
  movil,
  ficha,
  props,
  inicio,
  reiniciar,
  alSalir,
}: {
  movil: Movil;
  ficha: Ficha;
  props: Record<string, string>;
  inicio: "perfil" | "restaurar";
  reiniciar: () => void;
  alSalir: () => void;
}) {
  const [paso, setPaso] = useState<Paso>({ t: "leyendo" });
  const [lista, setLista] = useState<ListaCompacta | null>(null);
  const [detalles, setDetalles] = useState<Detalles>({});
  const [estados, setEstados] = useState<Map<string, EstadoPaquete>>(new Map());
  const [perfil, setPerfil] = useState<Perfil>("recomendado");
  const [modo, setModo] = useState<Modo>("quitar");
  const [conIcono, setConIcono] = useState<Set<string>>(new Set());
  const [desmarcadas, setDesmarcadas] = useState<Set<string>>(new Set()); // por defecto va marcado todo el perfil
  const [confirmado, setConfirmado] = useState(false); // PIN comprobado por el móvil, o casilla si no se puede
  const [fallosPin, setFallosPin] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [entiendo, setEntiendo] = useState(false);
  const detener = useRef(false);

  const recargar = useCallback(async () => {
    const [l, e] = await Promise.all([cargarLista(), leerEstados(movil)]);
    setLista(l);
    setEstados(e);
    return { l, e };
  }, [movil]);

  useEffect(() => {
    recargar()
      .then(() => setPaso(inicio === "restaurar" ? { t: "restaurar" } : { t: "elegir" }))
      .catch((e) => setPaso({ t: "error", mensaje: e instanceof Error ? e.message : String(e) }));
    cargarDetalles().then(setDetalles);
    leerConIcono(movil).then(setConIcono);
  }, [recargar, inicio, movil]);

  const plan = useMemo(() => (lista ? planDePerfil(estados, lista, perfil) : []), [estados, lista, perfil]);
  const tamanos = useMemo(() => (lista ? tamanoPerfiles(estados, lista) : null), [estados, lista]);
  const aplicables = useMemo(() => plan.filter((x) => !(modo === "desactivar" && x.estado === "desactivado")), [plan, modo]);
  const marcada = useCallback((x: ItemPlan) => !desmarcadas.has(x.paquete), [desmarcadas]);
  const elegidos = useMemo(() => aplicables.filter(marcada), [aplicables, marcada]);
  const hayExperto = elegidos.some((x) => x.nivel === "experto");

  const alternar = (p: string) =>
    setDesmarcadas((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });
  const marcarGrupo = (items: ItemPlan[], marcar: boolean) =>
    setDesmarcadas((s) => {
      const n = new Set(s);
      for (const x of items) {
        if (marcar) n.delete(x.paquete);
        else n.add(x.paquete);
      }
      return n;
    });

  // ------------------------------------------------------------------ aplicar
  const aplicar = async () => {
    detener.current = false;
    setPaso({ t: "aplicando", hechos: [], total: elegidos.length, actual: "Haciendo la copia de seguridad…" });
    try {
      // Estado justo antes de tocar nada: es lo que guarda la copia y lo que se vuelve a comprobar.
      const { l, e } = await recargar();
      const copia = crearCopiaEstado(movil.serie, props, e);
      const copiaLocal = guardarCopiaLocal(copia);
      descargarCopia(copia, ficha.nombre);

      const validos = new Set(planDePerfil(e, l, "experto").map((x) => x.paquete)); // nunca bloqueados ni desconocidos
      const objetivo = elegidos.map((x) => x.paquete).filter((p) => validos.has(p));
      // Las que no pasan el filtro se cuentan en los resultados con su motivo, no desaparecen sin avisar.
      const saltadas: Resultado[] = elegidos
        .filter((x) => !validos.has(x.paquete))
        .map(({ paquete }) => ({
          paquete,
          ok: false,
          saltada: true,
          texto: !e.has(paquete) || e.get(paquete) === "quitado" ? "Ya no estaba en el móvil." : "Poda no deja tocarla: el sistema la necesita.",
        }));
      const hechos: Resultado[] = [];
      for (const p of objetivo) {
        if (detener.current) break;
        setPaso({ t: "aplicando", hechos: [...hechos], total: objetivo.length, actual: p });
        if (modo === "quitar") {
          const r = await movil.shell(COMANDOS.quitar(p));
          if (RESPUESTA_OK.quitar(r)) {
            hechos.push({ paquete: p, ok: true, texto: "quitada" });
            continue;
          }
        }
        // Algunos fabricantes no dejan quitar ciertos paquetes, pero sí desactivarlos.
        if (e.get(p) === "desactivado" && modo === "desactivar") {
          hechos.push({ paquete: p, ok: true, texto: "ya estaba desactivada" });
          continue;
        }
        const r2 = await movil.shell(COMANDOS.desactivar(p));
        if (RESPUESTA_OK.desactivar(r2)) hechos.push({ paquete: p, ok: true, texto: modo === "quitar" ? "desactivada (no se dejó quitar)" : "desactivada" });
        else hechos.push({ paquete: p, ok: false, texto: r2.trim().slice(0, 140) || "sin respuesta" });
      }
      await recargar();
      setPaso({ t: "hecho", resultados: [...hechos, ...saltadas], copia, copiaLocal, detenido: detener.current });
    } catch (err) {
      setPaso({ t: "error", mensaje: err instanceof Error ? err.message : String(err) });
    }
  };

  // ------------------------------------------------------------------ restaurar
  const prepararRestaurar = async (copia: CopiaEstado) => {
    const { e } = await recargar();
    setPaso({ t: "restaurar-confirmar", copia, pasos: pasosParaRestaurar(copia, e) });
  };

  const restaurar = async (copia: CopiaEstado, pasos: PasoRestaurar[]) => {
    detener.current = false;
    const hechos: Resultado[] = [];
    try {
      for (const { paquete, accion } of pasos) {
        if (detener.current) break;
        setPaso({ t: "restaurando", hechos: [...hechos], total: pasos.length, actual: paquete });
        if (accion === "reinstalar") {
          let r = await movil.shell(COMANDOS.reinstalar(paquete));
          if (!RESPUESTA_OK.reinstalar(r)) r = await movil.shell(COMANDOS.reinstalarAntiguo(paquete)); // Android antiguo
          if (!RESPUESTA_OK.reinstalar(r)) {
            hechos.push({ paquete, ok: false, texto: r.trim().slice(0, 140) || "sin respuesta" });
            continue;
          }
          if (copia.paquetes[paquete] === "instalado") await movil.shell(COMANDOS.activar(paquete)); // por si además estaba desactivada
          hechos.push({ paquete, ok: true, texto: "reinstalada" });
        } else {
          const r = await movil.shell(COMANDOS.activar(paquete));
          hechos.push(RESPUESTA_OK.activar(r) ? { paquete, ok: true, texto: "reactivada" } : { paquete, ok: false, texto: r.trim().slice(0, 140) || "sin respuesta" });
        }
      }
      await recargar();
      setPaso({ t: "restaurado", resultados: hechos });
    } catch (err) {
      setPaso({ t: "error", mensaje: err instanceof Error ? err.message : String(err) });
    }
  };

  // ------------------------------------------------------------------ pantallas
  switch (paso.t) {
    case "leyendo":
      return (
        <section className="tarjeta" aria-live="polite">
          <div className="pulso" aria-hidden="true" />
          <h1 className="titulo t-l">Leyendo las apps de {ficha.nombre}…</h1>
        </section>
      );

    case "error":
      return (
        <section className="tarjeta">
          <p className="etiqueta error">Algo no ha ido bien</p>
          <h1 className="titulo t-l">No se pudo terminar.</h1>
          <p className="lead">{paso.mensaje}</p>
          <p className="sub">Si se desconectó el cable, vuelve a enchufarlo. Lo que ya se hizo se puede deshacer desde «Restaurar una copia».</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={alSalir}>
              Volver
            </button>
          </div>
        </section>
      );

    case "elegir":
      return (
        <section className="tarjeta dos podar">
          <div className="col podar-lateral">
            <p className="etiqueta">Paso 2 · Elegir perfil</p>
            <h1 className="titulo t-l">
              ¿Hasta <em>dónde?</em>
            </h1>
            <div className="perfiles" role="radiogroup" aria-label="Perfil">
              {(["seguro", "recomendado", "experto"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={perfil === p}
                  className={`perfil ${perfil === p ? "activo" : ""}`}
                  onClick={() => {
                    setPerfil(p);
                    setDesmarcadas(new Set());
                    setEntiendo(false);
                  }}
                >
                  <span className="perfil-cab">
                    <strong>{PERFIL_INFO[p].nombre}</strong>
                    <span className="perfil-n">{tamanos?.[p] ?? 0} apps</span>
                  </span>
                  <span className="perfil-texto">{PERFIL_INFO[p].texto}</span>
                </button>
              ))}
            </div>

            <fieldset className="modo">
              <legend>Cómo</legend>
              <label>
                <input type="radio" name="modo" checked={modo === "quitar"} onChange={() => setModo("quitar")} />
                <span>
                  <strong>Quitar para tu usuario</strong> — desaparecen y dejan de ejecutarse. Se recuperan con un clic.
                </span>
              </label>
              <label>
                <input type="radio" name="modo" checked={modo === "desactivar"} onChange={() => setModo("desactivar")} />
                <span>
                  <strong>Solo desactivar</strong> — más prudente: siguen en el móvil, pero apagadas.
                </span>
              </label>
            </fieldset>

            <div className="acciones">
              <button
                type="button"
                className="boton primario"
                disabled={!elegidos.length}
                onClick={() => {
                  setConfirmado(false);
                  setPaso({ t: "confirmar" });
                }}
              >
                {elegidos.length ? `Revisar y aplicar (${elegidos.length})` : aplicables.length ? "Marca al menos una app" : "No hay nada que quitar"}
              </button>
              <button type="button" className="boton" onClick={alSalir}>
                Volver
              </button>
            </div>
            <p className="sub">
              Vienen marcadas todas las apps del perfil. Las que llevan «tiene icono» las ves en tu móvil: desmárcalas si las usas. Antes de cambiar nada, Poda guarda una copia
              del estado de tus apps (en este navegador y como archivo). Lo que no conocemos y lo que el sistema necesita para arrancar no se toca nunca.
            </p>
          </div>

          <div className="col">
            <Lista items={aplicables} marcada={marcada} conIcono={conIcono} detalles={detalles} filtro={filtro} setFiltro={setFiltro} alternar={alternar} marcarGrupo={marcarGrupo} />
          </div>
        </section>
      );

    case "confirmar": {
      const porNivel = { seguro: 0, avanzado: 0, experto: 0 };
      for (const x of elegidos) porNivel[x.nivel]++;
      return (
        <section className="tarjeta dos">
          <div className="col">
            <p className="etiqueta">Paso 3 · Confirmar</p>
            <h1 className="titulo t-l">
              Vas a {modo === "quitar" ? "quitar" : "desactivar"} <em>{elegidos.length} apps</em> de {ficha.nombre}.
            </h1>
            <ul className="niveles">
              {(["seguro", "avanzado", "experto"] as const).map((n) => (
                <li key={n} className={`nivel ${n}`}>
                  <span className="n">{porNivel[n]}</span>
                  <span>{NOMBRE_GRUPO[n].toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col">
            <ol className="pasos">
              <li>
                <strong>Copia de seguridad. </strong>Se guarda en este navegador y se descarga un archivo <span className="mono">poda-copia-….json</span>. Guárdalo: con él puedes
                deshacerlo todo aunque borres el navegador.
              </li>
              <li>
                <strong>{modo === "quitar" ? "Quitar" : "Desactivar"} una a una. </strong>Si el fabricante no deja quitar alguna, se desactiva. Puedes parar en cualquier momento.
              </li>
              <li>
                <strong>Prueba el móvil antes de reiniciarlo: </strong>una llamada, escribir algo y una alarma. Si algo falla, lo deshaces desde aquí mismo. Las apps no se
                borran del sistema: no se libera almacenamiento.
              </li>
            </ol>
            <ConfirmarBloqueo
              movil={movil}
              sdk={ficha.sdk}
              accion={modo === "quitar" ? "quitar" : "desactivar"}
              total={elegidos.length}
              confirmado={confirmado}
              setConfirmado={setConfirmado}
              fallos={fallosPin}
              setFallos={setFallosPin}
            />
            {hayExperto && (
              <label className="entiendo">
                <input type="checkbox" checked={entiendo} onChange={(e) => setEntiendo(e.target.checked)} />
                <span>Entiendo que las apps «para expertos» pueden afectar a funciones del sistema y que, si algo falla, tendré que restaurar la copia.</span>
              </label>
            )}
            <div className="acciones">
              <button type="button" className="boton primario" disabled={!confirmado || (hayExperto && !entiendo)} onClick={aplicar}>
                Hacer copia y {modo === "quitar" ? "quitar" : "desactivar"}
              </button>
              <button type="button" className="boton" onClick={() => setPaso({ t: "elegir" })}>
                Volver a la lista
              </button>
            </div>
          </div>
        </section>
      );
    }

    case "aplicando":
    case "restaurando": {
      const hechos = paso.hechos.length;
      const pct = paso.total ? Math.round((hechos / paso.total) * 100) : 0;
      return (
        <section className="tarjeta" aria-live="polite">
          <p className="etiqueta">{paso.t === "aplicando" ? "Aplicando" : "Restaurando"} · no desconectes el cable</p>
          <h1 className="titulo t-l">
            {hechos} de {paso.total}
          </h1>
          <div className="barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="sub mono">{paso.actual}</p>
          <div className="acciones">
            <button type="button" className="boton" onClick={() => (detener.current = true)}>
              Parar después de esta
            </button>
          </div>
        </section>
      );
    }

    case "hecho": {
      const ok = paso.resultados.filter((r) => r.ok);
      const mal = paso.resultados.filter((r) => !r.ok && !r.saltada);
      const pasos = pasosParaRestaurar(paso.copia, estados);
      return (
        <section className="tarjeta dos">
          <div className="col">
            <p className="etiqueta">{paso.detenido ? "Parado a mitad" : "Hecho"}</p>
            <h1 className="titulo t-l">
              <em>{ok.length} apps</em> menos en {ficha.nombre}.
            </h1>
            <div className="avisos" role="note">
              <h2>Antes de reiniciar el móvil</h2>
              <ul>
                <li>Haz una llamada, escribe algo con el teclado y pon una alarma de prueba.</li>
                <li>Abre las apps que más usas.</li>
                <li>Si algo no va, pulsa «Deshacer estos cambios» ahora, con el móvil conectado.</li>
              </ul>
            </div>
            <p className="sub">
              Si después de reiniciar el móvil se queda en el logo, no lo borres: tiene arreglo. <Link href="/rescate/">Cómo recuperarlo</Link>.
            </p>
            {!paso.copiaLocal && <p className="sub">Este navegador no dejó guardar la copia: usa el archivo que se ha descargado.</p>}
            <div className="acciones">
              <button type="button" className="boton primario" onClick={reiniciar}>
                Ya lo he probado: reiniciar el móvil
              </button>
              <button type="button" className="boton" onClick={alSalir}>
                Volver a la ficha
              </button>
              {pasos.length > 0 && (
                <button type="button" className="boton" onClick={() => setPaso({ t: "restaurar-confirmar", copia: paso.copia, pasos })}>
                  Deshacer estos cambios
                </button>
              )}
              <button type="button" className="boton" onClick={() => descargarCopia(paso.copia, ficha.nombre)}>
                Descargar la copia otra vez
              </button>
            </div>
          </div>
          <div className="col">
            <Resultados resultados={paso.resultados} />
            {mal.length > 0 && <p className="sub">{mal.length} no se pudieron cambiar. Suele ser porque el fabricante lo impide; el resto del móvil no se ve afectado.</p>}
          </div>
        </section>
      );
    }

    case "restaurar":
      return <ElegirCopia serie={movil.serie} alElegir={prepararRestaurar} alVolver={alSalir} />;

    case "restaurar-confirmar":
      return <ConfirmarRestaurar copia={paso.copia} pasos={paso.pasos} otroMovil={paso.copia.serie !== movil.serie} restaurar={restaurar} volver={() => setPaso({ t: "restaurar" })} salir={alSalir} />;

    case "restaurado":
      return (
        <section className="tarjeta dos">
          <div className="col">
            <p className="etiqueta">Restaurado</p>
            <h1 className="titulo t-l">
              <em>{paso.resultados.filter((r) => r.ok).length} apps</em> de vuelta.
            </h1>
            <p className="lead">Reinicia el móvil para que todo vuelva a su sitio.</p>
            <div className="acciones">
              <button type="button" className="boton primario" onClick={reiniciar}>
                Reiniciar el móvil
              </button>
              <button type="button" className="boton" onClick={alSalir}>
                Volver a la ficha
              </button>
            </div>
          </div>
          <div className="col">
            <Resultados resultados={paso.resultados} />
          </div>
        </section>
      );
  }
}

function Lista({
  items,
  marcada,
  conIcono,
  detalles,
  filtro,
  setFiltro,
  alternar,
  marcarGrupo,
}: {
  items: ItemPlan[];
  marcada: (x: ItemPlan) => boolean;
  conIcono: Set<string>;
  detalles: Detalles;
  filtro: string;
  setFiltro: (s: string) => void;
  alternar: (p: string) => void;
  marcarGrupo: (items: ItemPlan[], marcar: boolean) => void;
}) {
  const f = filtro.trim().toLowerCase();
  const visibles = f ? items.filter((x) => x.paquete.toLowerCase().includes(f) || (detalles[x.paquete]?.[0] ?? "").toLowerCase().includes(f)) : items;
  if (!items.length) return <p className="sub">En este perfil no hay nada que quitar en tu móvil.</p>;
  return (
    <div className="podar-lista">
      <input className="buscar" type="search" placeholder="Buscar por nombre o descripción…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Buscar app" />
      {(["seguro", "avanzado", "experto"] as const).map((n) => {
        const grupo = visibles.filter((x) => x.nivel === n);
        if (!grupo.length) return null;
        const marcadas = grupo.filter(marcada).length;
        return (
          <section key={n} className="grupo">
            <header className="grupo-cab">
              <h2>
                {NOMBRE_GRUPO[n]} <span className="mono">({marcadas}/{grupo.length})</span>
              </h2>
              <button type="button" className="enlace" onClick={() => marcarGrupo(grupo, marcadas < grupo.length)}>
                {marcadas < grupo.length ? "Marcar todas" : "Desmarcar todas"}
              </button>
            </header>
            <p className="sub">{DESCRIPCION_NIVEL[n]}</p>
            <ul className="apps">
              {grupo.map((x) => {
                const d = detalles[x.paquete];
                const aviso = AVISO_PODA[x.paquete];
                return (
                  <li key={x.paquete}>
                    <label>
                      <input type="checkbox" checked={marcada(x)} onChange={() => alternar(x.paquete)} />
                      <span className="app-texto">
                        <code>{x.paquete}</code>
                        {aviso && <span className="app-aviso fuerte">{aviso}</span>}
                        {d?.[0] && <span className="app-desc">{d[0]}</span>}
                        {d?.[1]?.length ? <span className="app-aviso">Lo usan: {d[1].join(", ")}</span> : null}
                      </span>
                      <span className="app-chips">
                        {conIcono.has(x.paquete) && <span className="chip-claro icono">tiene icono</span>}
                        <span className="chip-claro">{x.origen}</span>
                        {x.estado === "desactivado" && <span className="chip-claro">ya desactivada</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="sub">
        Las apps con «tiene icono» aparecen en tu cajón de apps: vienen marcadas, desmárcalas si las usas. Avisos en español de Poda; descripciones en inglés de la
        lista de Universal Android Debloater (UAD-ng).
      </p>
    </div>
  );
}

/**
 * Confirmación con el PIN, la contraseña o el patrón del móvil. Lo comprueba el propio móvil
 * (`cmd lock_settings verify`); la web no lo guarda. Si el móvil no lo admite o no tiene bloqueo, casilla.
 */
function ConfirmarBloqueo({
  movil,
  sdk,
  accion,
  total,
  confirmado,
  setConfirmado,
  fallos,
  setFallos,
}: {
  movil: Movil;
  sdk: number;
  accion: "quitar" | "desactivar";
  total: number;
  confirmado: boolean;
  setConfirmado: (v: boolean) => void;
  fallos: number;
  setFallos: (n: number) => void;
}) {
  const [forma, setForma] = useState<"pin" | "casilla">(sdk >= 26 ? "pin" : "casilla"); // lock_settings verify: Android 8+
  const [pin, setPin] = useState("");
  const [comprobando, setComprobando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const agotado = fallos >= MAX_FALLOS_PIN;

  const comprobar = async () => {
    if (!esCredencialValida(pin)) {
      setMensaje("Escribe el PIN, la contraseña o el patrón (como números del 1 al 9).");
      return;
    }
    setComprobando(true);
    setMensaje("");
    let r;
    try {
      r = leerRespuestaBloqueo(await movil.shell(comandoVerificarBloqueo(pin)));
    } catch {
      r = "no-disponible" as const;
    }
    setPin("");
    setComprobando(false);
    if (r === "correcto") setConfirmado(true);
    else if (r === "incorrecto") {
      const n = fallos + 1;
      setFallos(n);
      setMensaje(
        n >= MAX_FALLOS_PIN
          ? "Has fallado 3 veces. Para que el móvil no se bloquee, Poda no deja probar más. Desbloquea el móvil a mano para comprobar el PIN y vuelve a abrir esta página."
          : `No es correcto. Te quedan ${MAX_FALLOS_PIN - n} intentos.`,
      );
    } else if (r === "esperar") setMensaje("El móvil pide esperar un poco antes de otro intento.");
    else {
      setForma("casilla");
      setMensaje(r === "sin-bloqueo" ? "Tu móvil no tiene bloqueo de pantalla: confirma con la casilla." : "Tu móvil no deja comprobar el PIN por el cable: confirma con la casilla.");
    }
  };

  if (forma === "casilla") {
    return (
      <>
        {mensaje && <p className="sub">{mensaje}</p>}
        <label className="entiendo">
          <input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} />
          <span>
            Confirmo que quiero {accion} estas {total} apps.
          </span>
        </label>
      </>
    );
  }
  if (confirmado) return <p className="sub">PIN correcto: ya puedes {accion} las apps.</p>;
  return (
    <form
      className="pin"
      onSubmit={(e) => {
        e.preventDefault();
        void comprobar();
      }}
    >
      <label htmlFor="pin-movil">
        <strong>Confirma con el PIN, la contraseña o el patrón de tu móvil.</strong> Lo comprueba el móvil; Poda no lo guarda. El patrón se escribe con los números de
        los puntos (1 a 9, de arriba abajo y de izquierda a derecha). Cada fallo cuenta como un intento de desbloqueo.
      </label>
      <div className="acciones">
        <input
          id="pin-movil"
          className="buscar"
          type="password"
          autoComplete="off"
          value={pin}
          maxLength={64}
          disabled={agotado || comprobando}
          onChange={(e) => setPin(e.target.value)}
        />
        <button type="submit" className="boton" disabled={agotado || comprobando || !pin}>
          {comprobando ? "Comprobando…" : "Comprobar"}
        </button>
      </div>
      {mensaje && (
        <p className="sub" role="alert">
          {mensaje}
        </p>
      )}
    </form>
  );
}

function Resultados({ resultados }: { resultados: Resultado[] }) {
  if (!resultados.length) return <p className="sub">No se ha cambiado nada.</p>;
  return (
    <ul className="apps resultados">
      {resultados.map((r) => (
        <li key={r.paquete} className={r.ok ? "" : "mal"}>
          <span className="app-texto">
            <code>{r.paquete}</code>
          </span>
          <span className="app-chips">
            <span className={`chip-claro ${r.ok ? "" : "fuerte"}`}>{r.ok ? r.texto : r.saltada ? "saltada" : "no se pudo"}</span>
          </span>
          {!r.ok && <span className="app-desc">{r.texto}</span>}
        </li>
      ))}
    </ul>
  );
}

function ElegirCopia({ serie, alElegir, alVolver }: { serie: string; alElegir: (c: CopiaEstado) => void; alVolver: () => void }) {
  const [copias] = useState(() => copiasGuardadas(serie));
  const [error, setError] = useState("");
  const leerArchivo = async (f: File | undefined) => {
    if (!f) return;
    try {
      alElegir(leerCopiaEstado(await f.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
  };
  return (
    <section className="tarjeta dos">
      <div className="col">
        <p className="etiqueta">Restaurar una copia</p>
        <h1 className="titulo t-l">
          Volver a como <em>estaba.</em>
        </h1>
        <p className="lead">Elige una copia guardada en este navegador o sube el archivo poda-copia-….json que se descargó. Restaurar solo devuelve apps: no quita nada.</p>
        <div className="acciones">
          <label className="boton">
            Subir archivo de copia
            <input type="file" accept="application/json,.json" hidden onChange={(e) => leerArchivo(e.target.files?.[0])} />
          </label>
          <button type="button" className="boton" onClick={alVolver}>
            Volver
          </button>
        </div>
        {error && <p className="sub" style={{ color: "#b42318" }}>{error}</p>}
      </div>
      <div className="col">
        {copias.length ? (
          <ul className="apps">
            {copias.map((c) => (
              <li key={c.creada}>
                <span className="app-texto">
                  <strong>{new Date(c.creada).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" })}</strong>
                  <span className="app-desc">{Object.values(c.paquetes).filter((x) => x !== "quitado").length} apps en el móvil en ese momento</span>
                </span>
                <button type="button" className="boton pequeno" onClick={() => alElegir(c)}>
                  Usar esta
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sub">No hay copias de este móvil en este navegador.</p>
        )}
      </div>
    </section>
  );
}

function ConfirmarRestaurar({
  copia,
  pasos,
  otroMovil,
  restaurar,
  volver,
  salir,
}: {
  copia: CopiaEstado;
  pasos: PasoRestaurar[];
  otroMovil: boolean;
  restaurar: (c: CopiaEstado, p: PasoRestaurar[]) => void;
  volver: () => void;
  salir: () => void;
}) {
  const [fuera, setFuera] = useState<Set<string>>(new Set()); // desmarcadas
  const [filtro, setFiltro] = useState("");
  const elegidos = pasos.filter((p) => !fuera.has(p.paquete));
  const f = filtro.trim().toLowerCase();
  const visibles = f ? pasos.filter((p) => p.paquete.toLowerCase().includes(f)) : pasos;
  const fecha = new Date(copia.creada).toLocaleString("es-ES", { dateStyle: "long", timeStyle: "short" });

  if (!pasos.length) {
    return (
      <section className="tarjeta">
        <p className="etiqueta">Restaurar · copia del {fecha}</p>
        <h1 className="titulo t-l">Ya está todo como en la copia.</h1>
        <div className="acciones">
          <button type="button" className="boton primario" onClick={salir}>
            Volver a la ficha
          </button>
          <button type="button" className="boton" onClick={volver}>
            Elegir otra copia
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="tarjeta dos podar">
      <div className="col podar-lateral">
        <p className="etiqueta">Restaurar · copia del {fecha}</p>
        <h1 className="titulo t-l">
          Recuperar <em>{elegidos.length} apps.</em>
        </h1>
        <p className="lead">Elige qué apps quieres de vuelta. Restaurar solo reinstala o reactiva: nunca quita nada.</p>
        {otroMovil && <p className="sub">Ojo: esta copia es de otro móvil. Solo se recuperarán las apps que existan en este.</p>}
        <div className="acciones">
          <button type="button" className="boton primario" disabled={!elegidos.length} onClick={() => restaurar(copia, elegidos)}>
            Restaurar ({elegidos.length})
          </button>
          <button type="button" className="boton" onClick={volver}>
            Elegir otra copia
          </button>
        </div>
      </div>
      <div className="col podar-lista">
        <input className="buscar" type="search" placeholder="Buscar app…" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Buscar app" />
        <header className="grupo-cab">
          <h2>
            Apps de la copia <span className="mono">({elegidos.length}/{pasos.length})</span>
          </h2>
          <button type="button" className="enlace" onClick={() => setFuera(elegidos.length < pasos.length ? new Set() : new Set(pasos.map((p) => p.paquete)))}>
            {elegidos.length < pasos.length ? "Marcar todas" : "Desmarcar todas"}
          </button>
        </header>
        <ul className="apps">
          {visibles.map((p) => (
            <li key={p.paquete}>
              <label>
                <input
                  type="checkbox"
                  checked={!fuera.has(p.paquete)}
                  onChange={() =>
                    setFuera((s) => {
                      const n = new Set(s);
                      if (n.has(p.paquete)) n.delete(p.paquete);
                      else n.add(p.paquete);
                      return n;
                    })
                  }
                />
                <span className="app-texto">
                  <code>{p.paquete}</code>
                  {AVISO_PODA[p.paquete] && <span className="app-desc">{AVISO_PODA[p.paquete]}</span>}
                </span>
                <span className="app-chips">
                  <span className="chip-claro">{p.accion === "reinstalar" ? "reinstalar" : "reactivar"}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
