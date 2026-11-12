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
  esCredencialValida,
  estadosDe,
  leerCopiaEstado,
  leerRespuestaBloqueo,
  origenEn,
  paquetesConIcono,
  paquetesDe,
  pasosParaRestaurar,
  planDePerfil,
  RESPUESTA_OK,
  TEXTOS_NUCLEO,
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
import { fmt } from "@/lib/rutas";
import { rico } from "./Rico";
import { useTextos } from "./Textos";
import { cargarDetalles, cargarLista, copiasGuardadas, descargarCopia, guardarCopiaLocal, type Detalles } from "@/lib/datos";

type Modo = "quitar" | "desactivar";
/** Estado de cada app en los resultados. El texto sale del diccionario (podar.estado). */
type EstadoResultado = "quitada" | "desactivada" | "desactivadaNoQuitar" | "yaDesactivada" | "reinstalada" | "reactivada" | "saltada" | "fallo";
/** `detalle`: respuesta del móvil cuando falla (tal cual, en inglés) o el motivo de una saltada. */
type Resultado = { paquete: string; ok: boolean; estado: EstadoResultado; detalle?: string };

type Paso =
  | { t: "leyendo" }
  | { t: "elegir" }
  | { t: "confirmar" }
  | { t: "aplicando"; hechos: Resultado[]; total: number; actual: string | null }
  | { t: "hecho"; resultados: Resultado[]; copia: CopiaEstado; copiaLocal: boolean; detenido: boolean }
  | { t: "restaurar" }
  | { t: "restaurar-confirmar"; copia: CopiaEstado; pasos: PasoRestaurar[] }
  | { t: "restaurando"; hechos: Resultado[]; total: number; actual: string }
  | { t: "restaurado"; resultados: Resultado[] }
  | { t: "error"; mensaje: string };

/** Respuesta del móvil cuando algo falla: se enseña tal cual, recortada. */
const respuesta = (s: string) => s.trim().slice(0, 140) || undefined;

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
  const { idioma, t: textos } = useTextos();
  const t = textos.podar;
  const r = (x: string) => rico(x, idioma);
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
    setPaso({ t: "aplicando", hechos: [], total: elegidos.length, actual: null });
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
          estado: "saltada" as const,
          detalle: !e.has(paquete) || e.get(paquete) === "quitado" ? t.saltadaNoEsta : t.saltadaProtegida,
        }));
      const hechos: Resultado[] = [];
      for (const p of objetivo) {
        if (detener.current) break;
        setPaso({ t: "aplicando", hechos: [...hechos], total: objetivo.length, actual: p });
        if (modo === "quitar") {
          const r = await movil.shell(COMANDOS.quitar(p));
          if (RESPUESTA_OK.quitar(r)) {
            hechos.push({ paquete: p, ok: true, estado: "quitada" });
            continue;
          }
        }
        // Algunos fabricantes no dejan quitar ciertos paquetes, pero sí desactivarlos.
        if (e.get(p) === "desactivado" && modo === "desactivar") {
          hechos.push({ paquete: p, ok: true, estado: "yaDesactivada" });
          continue;
        }
        const r2 = await movil.shell(COMANDOS.desactivar(p));
        if (RESPUESTA_OK.desactivar(r2)) hechos.push({ paquete: p, ok: true, estado: modo === "quitar" ? "desactivadaNoQuitar" : "desactivada" });
        else hechos.push({ paquete: p, ok: false, estado: "fallo", detalle: respuesta(r2) });
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
            hechos.push({ paquete, ok: false, estado: "fallo", detalle: respuesta(r) });
            continue;
          }
          if (copia.paquetes[paquete] === "instalado") await movil.shell(COMANDOS.activar(paquete)); // por si además estaba desactivada
          hechos.push({ paquete, ok: true, estado: "reinstalada" });
        } else {
          const r = await movil.shell(COMANDOS.activar(paquete));
          hechos.push(RESPUESTA_OK.activar(r) ? { paquete, ok: true, estado: "reactivada" } : { paquete, ok: false, estado: "fallo", detalle: respuesta(r) });
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
          <h1 className="titulo t-l">{fmt(t.leyendo, { nombre: ficha.nombre })}</h1>
        </section>
      );

    case "error":
      return (
        <section className="tarjeta">
          <p className="etiqueta error">{t.errorEtiqueta}</p>
          <h1 className="titulo t-l">{t.errorTitulo}</h1>
          <p className="lead">{paso.mensaje}</p>
          <p className="sub">{t.errorConsejo}</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={alSalir}>
              {t.volver}
            </button>
          </div>
        </section>
      );

    case "elegir":
      return (
        <section className="tarjeta dos podar">
          <div className="col podar-lateral">
            <p className="etiqueta">{t.elegirEtiqueta}</p>
            <h1 className="titulo t-l">{r(t.elegirTitulo)}</h1>
            <div className="perfiles" role="radiogroup" aria-label={t.perfilAria}>
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
                    <strong>{t.perfil[p].nombre}</strong>
                    <span className="perfil-n">{fmt(t.nApps, { n: tamanos?.[p] ?? 0 })}</span>
                  </span>
                  <span className="perfil-texto">{t.perfil[p].texto}</span>
                </button>
              ))}
            </div>

            <fieldset className="modo">
              <legend>{t.como}</legend>
              <label>
                <input type="radio" name="modo" checked={modo === "quitar"} onChange={() => setModo("quitar")} />
                <span>{r(t.modoQuitar)}</span>
              </label>
              <label>
                <input type="radio" name="modo" checked={modo === "desactivar"} onChange={() => setModo("desactivar")} />
                <span>{r(t.modoDesactivar)}</span>
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
                {elegidos.length ? fmt(t.revisar, { n: elegidos.length }) : aplicables.length ? t.marcaUna : t.nadaQueQuitar}
              </button>
              <button type="button" className="boton" onClick={alSalir}>
                {t.volver}
              </button>
            </div>
            <p className="sub">{t.elegirNota}</p>
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
            <p className="etiqueta">{t.confirmarEtiqueta}</p>
            <h1 className="titulo t-l">{r(fmt(modo === "quitar" ? t.vasAQuitar : t.vasADesactivar, { n: elegidos.length, nombre: ficha.nombre }))}</h1>
            <ul className="niveles">
              {(["seguro", "avanzado", "experto"] as const).map((n) => (
                <li key={n} className={`nivel ${n}`}>
                  <span className="n">{porNivel[n]}</span>
                  <span>{t.grupo[n].toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col">
            <ol className="pasos">
              <li>{r(t.pasoCopia)}</li>
              <li>{r(modo === "quitar" ? t.pasoQuitar : t.pasoDesactivar)}</li>
              <li>{r(t.pasoProbar)}</li>
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
                <span>{t.entiendo}</span>
              </label>
            )}
            <div className="acciones">
              <button type="button" className="boton primario" disabled={!confirmado || (hayExperto && !entiendo)} onClick={aplicar}>
                {modo === "quitar" ? t.hacerQuitar : t.hacerDesactivar}
              </button>
              <button type="button" className="boton" onClick={() => setPaso({ t: "elegir" })}>
                {t.volverLista}
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
          <p className="etiqueta">{paso.t === "aplicando" ? t.aplicando : t.restaurando}</p>
          <h1 className="titulo t-l">{fmt(t.deTotal, { n: hechos, total: paso.total })}</h1>
          <div className="barra" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${pct}%` }} />
          </div>
          <p className="sub mono">{paso.actual ?? t.copiaEnCurso}</p>
          <div className="acciones">
            <button type="button" className="boton" onClick={() => (detener.current = true)}>
              {t.parar}
            </button>
          </div>
        </section>
      );
    }

    case "hecho": {
      const ok = paso.resultados.filter((x) => x.ok);
      const mal = paso.resultados.filter((x) => !x.ok && x.estado !== "saltada");
      const pasos = pasosParaRestaurar(paso.copia, estados);
      return (
        <section className="tarjeta dos">
          <div className="col">
            <p className="etiqueta">{paso.detenido ? t.parado : t.hecho}</p>
            <h1 className="titulo t-l">{r(fmt(t.menos, { n: ok.length, nombre: ficha.nombre }))}</h1>
            <div className="avisos" role="note">
              <h2>{t.antesReiniciar}</h2>
              <ul>
                {t.probar.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <p className="sub">{r(t.enElLogo)}</p>
            {!paso.copiaLocal && <p className="sub">{t.sinCopiaLocal}</p>}
            <div className="acciones">
              <button type="button" className="boton primario" onClick={reiniciar}>
                {t.yaProbado}
              </button>
              <button type="button" className="boton" onClick={alSalir}>
                {t.volverFicha}
              </button>
              {pasos.length > 0 && (
                <button type="button" className="boton" onClick={() => setPaso({ t: "restaurar-confirmar", copia: paso.copia, pasos })}>
                  {t.deshacer}
                </button>
              )}
              <button type="button" className="boton" onClick={() => descargarCopia(paso.copia, ficha.nombre)}>
                {t.descargarOtra}
              </button>
            </div>
          </div>
          <div className="col">
            <Resultados resultados={paso.resultados} />
            {mal.length > 0 && <p className="sub">{fmt(t.noSePudieron, { n: mal.length })}</p>}
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
            <p className="etiqueta">{t.restauradoEtiqueta}</p>
            <h1 className="titulo t-l">{r(fmt(t.deVuelta, { n: paso.resultados.filter((x) => x.ok).length }))}</h1>
            <p className="lead">{t.reiniciaTexto}</p>
            <div className="acciones">
              <button type="button" className="boton primario" onClick={reiniciar}>
                {t.reiniciar}
              </button>
              <button type="button" className="boton" onClick={alSalir}>
                {t.volverFicha}
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
  const { idioma, t: textos } = useTextos();
  const t = textos.podar;
  const avisos = TEXTOS_NUCLEO[idioma].avisoPoda;
  const f = filtro.trim().toLowerCase();
  const visibles = f ? items.filter((x) => x.paquete.toLowerCase().includes(f) || (detalles[x.paquete]?.[0] ?? "").toLowerCase().includes(f)) : items;
  if (!items.length) return <p className="sub">{t.vacio}</p>;
  return (
    <div className="podar-lista">
      <input className="buscar" type="search" placeholder={t.buscar} value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label={t.buscarAria} />
      {(["seguro", "avanzado", "experto"] as const).map((n) => {
        const grupo = visibles.filter((x) => x.nivel === n);
        if (!grupo.length) return null;
        const marcadas = grupo.filter(marcada).length;
        return (
          <section key={n} className="grupo">
            <header className="grupo-cab">
              <h2>
                {t.grupo[n]} <span className="mono">({marcadas}/{grupo.length})</span>
              </h2>
              <button type="button" className="enlace" onClick={() => marcarGrupo(grupo, marcadas < grupo.length)}>
                {marcadas < grupo.length ? t.marcarTodas : t.desmarcarTodas}
              </button>
            </header>
            <p className="sub">{TEXTOS_NUCLEO[idioma].nivel[n]}</p>
            <ul className="apps">
              {grupo.map((x) => {
                const d = detalles[x.paquete];
                const aviso = AVISO_PODA[x.paquete] && avisos[x.paquete];
                return (
                  <li key={x.paquete}>
                    <label>
                      <input type="checkbox" checked={marcada(x)} onChange={() => alternar(x.paquete)} />
                      <span className="app-texto">
                        <code>{x.paquete}</code>
                        {aviso && <span className="app-aviso fuerte">{aviso}</span>}
                        {d?.[0] && <span className="app-desc">{d[0]}</span>}
                        {d?.[1]?.length ? <span className="app-aviso">{fmt(t.loUsan, { lista: d[1].join(", ") })}</span> : null}
                      </span>
                      <span className="app-chips">
                        {conIcono.has(x.paquete) && <span className="chip-claro icono">{t.tieneIcono}</span>}
                        <span className="chip-claro">{origenEn(x.origen, idioma)}</span>
                        {x.estado === "desactivado" && <span className="chip-claro">{t.yaDesactivada}</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="sub">{t.listaNota}</p>
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
  const { idioma, t: textos } = useTextos();
  const t = textos.podar;
  const [forma, setForma] = useState<"pin" | "casilla">(sdk >= 26 ? "pin" : "casilla"); // lock_settings verify: Android 8+
  const [pin, setPin] = useState("");
  const [comprobando, setComprobando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const agotado = fallos >= MAX_FALLOS_PIN;

  const comprobar = async () => {
    if (!esCredencialValida(pin)) {
      setMensaje(t.pinVacio);
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
        n >= MAX_FALLOS_PIN ? t.pinAgotado : fmt(t.pinMal, { n: MAX_FALLOS_PIN - n }),
      );
    } else if (r === "esperar") setMensaje(t.pinEsperar);
    else {
      setForma("casilla");
      setMensaje(r === "sin-bloqueo" ? t.pinSinBloqueo : t.pinNoDisponible);
    }
  };

  if (forma === "casilla") {
    return (
      <>
        {mensaje && <p className="sub">{mensaje}</p>}
        <label className="entiendo">
          <input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} />
          <span>{fmt(accion === "quitar" ? t.pinCasillaQuitar : t.pinCasillaDesactivar, { n: total })}</span>
        </label>
      </>
    );
  }
  if (confirmado) return <p className="sub">{accion === "quitar" ? t.pinOkQuitar : t.pinOkDesactivar}</p>;
  return (
    <form
      className="pin"
      onSubmit={(e) => {
        e.preventDefault();
        void comprobar();
      }}
    >
      <label htmlFor="pin-movil">{rico(t.pinTitulo, idioma)}</label>
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
          {comprobando ? t.comprobando : t.comprobar}
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
  const { t } = useTextos();
  if (!resultados.length) return <p className="sub">{t.podar.sinCambios}</p>;
  return (
    <ul className="apps resultados">
      {resultados.map((r) => (
        <li key={r.paquete} className={r.ok ? "" : "mal"}>
          <span className="app-texto">
            <code>{r.paquete}</code>
          </span>
          <span className="app-chips">
            <span className={`chip-claro ${r.ok ? "" : "fuerte"}`}>{t.podar.estado[r.estado]}</span>
          </span>
          {!r.ok && <span className="app-desc">{r.detalle ?? t.podar.estado.sinRespuesta}</span>}
        </li>
      ))}
    </ul>
  );
}

function ElegirCopia({ serie, alElegir, alVolver }: { serie: string; alElegir: (c: CopiaEstado) => void; alVolver: () => void }) {
  const { idioma, t: textos } = useTextos();
  const t = textos.podar;
  const [copias] = useState(() => copiasGuardadas(serie));
  const [error, setError] = useState("");
  const leerArchivo = async (f: File | undefined) => {
    if (!f) return;
    try {
      alElegir(leerCopiaEstado(await f.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : t.archivoMal);
    }
  };
  return (
    <section className="tarjeta dos">
      <div className="col">
        <p className="etiqueta">{t.restaurarEtiqueta}</p>
        <h1 className="titulo t-l">{rico(t.restaurarTitulo, idioma)}</h1>
        <p className="lead">{t.restaurarTexto}</p>
        <div className="acciones">
          <label className="boton">
            {t.subirArchivo}
            <input type="file" accept="application/json,.json" hidden onChange={(e) => leerArchivo(e.target.files?.[0])} />
          </label>
          <button type="button" className="boton" onClick={alVolver}>
            {t.volver}
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
                  <strong>{new Date(c.creada).toLocaleString(textos.idioma.fecha, { dateStyle: "long", timeStyle: "short" })}</strong>
                  <span className="app-desc">{fmt(t.appsEnCopia, { n: Object.values(c.paquetes).filter((x) => x !== "quitado").length })}</span>
                </span>
                <button type="button" className="boton pequeno" onClick={() => alElegir(c)}>
                  {t.usarEsta}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sub">{t.sinCopias}</p>
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
  const { idioma, t: textos } = useTextos();
  const t = textos.podar;
  const avisos = TEXTOS_NUCLEO[idioma].avisoPoda;
  const [fuera, setFuera] = useState<Set<string>>(new Set()); // desmarcadas
  const [filtro, setFiltro] = useState("");
  const elegidos = pasos.filter((p) => !fuera.has(p.paquete));
  const f = filtro.trim().toLowerCase();
  const visibles = f ? pasos.filter((p) => p.paquete.toLowerCase().includes(f)) : pasos;
  const fecha = new Date(copia.creada).toLocaleString(textos.idioma.fecha, { dateStyle: "long", timeStyle: "short" });

  if (!pasos.length) {
    return (
      <section className="tarjeta">
        <p className="etiqueta">{fmt(t.copiaDel, { fecha })}</p>
        <h1 className="titulo t-l">{t.yaComoCopia}</h1>
        <div className="acciones">
          <button type="button" className="boton primario" onClick={salir}>
            {t.volverFicha}
          </button>
          <button type="button" className="boton" onClick={volver}>
            {t.elegirOtra}
          </button>
        </div>
      </section>
    );
  }
  return (
    <section className="tarjeta dos podar">
      <div className="col podar-lateral">
        <p className="etiqueta">{fmt(t.copiaDel, { fecha })}</p>
        <h1 className="titulo t-l">{rico(fmt(t.recuperar, { n: elegidos.length }), idioma)}</h1>
        <p className="lead">{t.recuperarTexto}</p>
        {otroMovil && <p className="sub">{t.otroMovil}</p>}
        <div className="acciones">
          <button type="button" className="boton primario" disabled={!elegidos.length} onClick={() => restaurar(copia, elegidos)}>
            {fmt(t.restaurarN, { n: elegidos.length })}
          </button>
          <button type="button" className="boton" onClick={volver}>
            {t.elegirOtra}
          </button>
        </div>
      </div>
      <div className="col podar-lista">
        <input className="buscar" type="search" placeholder={t.buscarCorto} value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label={t.buscarAria} />
        <header className="grupo-cab">
          <h2>
            {t.appsCopia} <span className="mono">({elegidos.length}/{pasos.length})</span>
          </h2>
          <button type="button" className="enlace" onClick={() => setFuera(elegidos.length < pasos.length ? new Set() : new Set(pasos.map((p) => p.paquete)))}>
            {elegidos.length < pasos.length ? t.marcarTodas : t.desmarcarTodas}
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
                  {AVISO_PODA[p.paquete] && <span className="app-desc">{avisos[p.paquete]}</span>}
                </span>
                <span className="app-chips">
                  <span className="chip-claro">{p.accion === "reinstalar" ? t.reinstalar : t.reactivar}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
