"use client";
// Herramienta de conexión: reconoce el móvil por WebUSB y cuenta el bloatware. Solo lee: no cambia nada.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  avisosFicha,
  capaEn,
  CLAVES_TECNICAS,
  contar,
  fichaDesdeProps,
  NIVELES,
  origenEn,
  paquetesDe,
  parsearGetprop,
  type Ficha,
  type Recuento,
} from "@poda/nucleo";
import { TarjetaResultado } from "./Compartir";
import { rico } from "./Rico";
import { useTextos } from "./Textos";
import { fmt, ruta } from "@/lib/rutas";
import { Podar } from "./Podar";
import { cargarLista } from "@/lib/datos";
import { conectar, dispositivosConPermiso, elegirDispositivo, ErrorConexion, esperarArranque, movilDemo, webUsbDisponible, type Movil } from "@/lib/conexion";

type Estado =
  | { t: "cargando" }
  | { t: "sin-webusb" }
  | { t: "inicio" }
  | { t: "eligiendo" }
  | { t: "autorizando"; nombre: string }
  | { t: "leyendo"; nombre: string }
  | { t: "listo"; ficha: Ficha; props: Record<string, string>; recuento: Recuento | null; demo: boolean; reiniciado?: boolean }
  | { t: "reiniciando"; nombre: string; desde: number; arrancando: boolean }
  | { t: "podar"; inicio: "perfil" | "restaurar"; ficha: Ficha; props: Record<string, string>; recuento: Recuento | null; demo: boolean }
  | { t: "desconectado"; nombre: string }
  | { t: "error"; mensaje: string };


export function Conectar() {
  const { idioma, t: textos } = useTextos();
  const t = textos.conectar;
  const r = (x: string) => rico(x, idioma);
  const [estado, setEstado] = useState<Estado>({ t: "cargando" });
  const movilRef = useRef<Movil | null>(null);
  const ocupado = useRef(false);
  const reiniciando = useRef(false); // durante un reinicio, la desconexión es lo esperado

  const recontar = async (movil: Movil) => {
    try {
      const [todos, presentes, lista] = await Promise.all([
        movil.shell(["pm", "list", "packages", "-u", "--user", "0"]),
        movil.shell(["pm", "list", "packages", "--user", "0"]),
        cargarLista(),
      ]);
      const recuento = contar(paquetesDe(todos), paquetesDe(presentes), lista);
      if (movilRef.current === movil) setEstado((e) => (e.t === "listo" || e.t === "podar" ? { ...e, recuento } : e));
    } catch {
      /* la ficha ya está; el recuento es secundario */
    }
  };

  const leerMovil = useCallback(async (movil: Movil, demo: boolean) => {
    movilRef.current = movil;
    const trasReinicio = reiniciando.current;
    if (trasReinicio) {
      setEstado((e) => (e.t === "reiniciando" ? { ...e, arrancando: true } : e));
      await esperarArranque(movil);
      reiniciando.current = false;
    } else {
      setEstado({ t: "leyendo", nombre: movil.nombreUsb });
    }
    const props = parsearGetprop(await movil.getprop());
    const ficha = fichaDesdeProps(props);
    setEstado({ t: "listo", ficha, props, recuento: null, demo, reiniciado: trasReinicio });
    movil.desconectado.then(() => {
      if (movilRef.current === movil) {
        movilRef.current = null;
        setEstado({ t: "desconectado", nombre: ficha.nombre });
      }
    });
    await recontar(movil);
  }, []);

  const conectarCon = useCallback(
    async (obtener: () => Promise<Awaited<ReturnType<typeof elegirDispositivo>> | undefined>) => {
      if (ocupado.current) return;
      ocupado.current = true;
      try {
        const d = await obtener();
        if (!d) return;
        const movil = await conectar(d, () => {
          if (!reiniciando.current) setEstado({ t: "autorizando", nombre: d.name });
        });
        await leerMovil(movil, false);
      } catch (e) {
        if (e instanceof ErrorConexion && e.tipo === "cancelado") setEstado({ t: "inicio" });
        else if (e instanceof ErrorConexion && e.tipo === "ocupado") setEstado({ t: "error", mensaje: t.errores.ocupado });
        else setEstado({ t: "error", mensaje: e instanceof Error ? e.message : String(e) });
      } finally {
        ocupado.current = false;
      }
    },
    [leerMovil, t],
  );

  const reiniciar = async (nombre: string) => {
    const movil = movilRef.current;
    if (!movil) return;
    reiniciando.current = true;
    movilRef.current = null; // la desconexión que viene no es un error
    setEstado({ t: "reiniciando", nombre, desde: Date.now(), arrancando: false });
    window.scrollTo({ top: 0 });
    await movil.reiniciar();
    if (movil.serie === "demo") setTimeout(() => void leerMovil(movil, true), 5000); // en el demo no hay USB que vuelva
  };

  const conectarNuevo = () => {
    setEstado({ t: "eligiendo" });
    void conectarCon(elegirDispositivo);
  };
  const verDemo = () => {
    if (!movilRef.current) void leerMovil(movilDemo(), true);
  };
  const volverAlInicio = () => {
    movilRef.current = null;
    setEstado(webUsbDisponible() ? { t: "inicio" } : { t: "sin-webusb" });
  };

  // Al cargar: modo demo, o reconocer un móvil al que ya se dio permiso; y escuchar enchufes y desenchufes.
  useEffect(() => {
    const demo = new URLSearchParams(location.search).has("demo") || process.env.NEXT_PUBLIC_DEMO === "1";
    if (demo) {
      verDemo();
      return;
    }
    if (!webUsbDisponible()) {
      setEstado({ t: "sin-webusb" });
      return;
    }
    setEstado({ t: "inicio" });
    const conocido = () => conectarCon(async () => (await dispositivosConPermiso())[0]);
    dispositivosConPermiso().then((ds) => {
      if (ds.length) void conocido();
    });
    const alConectar = () => {
      if (!movilRef.current) void conocido();
    };
    const alDesconectar = () => {
      if (movilRef.current) {
        movilRef.current = null;
        setEstado((e) => ({ t: "desconectado", nombre: e.t === "listo" ? e.ficha.nombre : t.elMovil }));
      }
    };
    navigator.usb.addEventListener("connect", alConectar);
    navigator.usb.addEventListener("disconnect", alDesconectar);
    return () => {
      navigator.usb.removeEventListener("connect", alConectar);
      navigator.usb.removeEventListener("disconnect", alDesconectar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (estado.t) {
    case "cargando":
      return <Espera titulo={t.cargandoTitulo} texto={t.cargandoTexto} />;
    case "sin-webusb":
      return (
        <section className="tarjeta">
          <p className="etiqueta error">{t.sinWebusbEtiqueta}</p>
          <h1 className="titulo t-l">{r(t.sinWebusbTitulo)}</h1>
          <p className="lead">{t.sinWebusbTexto}</p>
          <div className="acciones">
            <button type="button" className="boton" onClick={verDemo}>
              {t.verDemo}
            </button>
          </div>
        </section>
      );
    case "inicio":
      return (
        <section className="tarjeta dos">
          <div className="col">
          <p className="etiqueta">{t.inicioEtiqueta}</p>
          <h1 className="titulo t-l">{r(t.inicioTitulo)}</h1>
          <p className="lead">{t.inicioTexto}</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={conectarNuevo}>
              {t.conectar}
            </button>
            <button type="button" className="boton" onClick={verDemo}>
              {t.verDemo}
            </button>
          </div>
          </div>
          <div className="col">
          <ol className="pasos">
            {t.pasos.map((p) => (
              <li key={p}>{r(p)}</li>
            ))}
          </ol>
          </div>
        </section>
      );
    case "eligiendo":
      return <Espera titulo={t.eligiendoTitulo} texto={t.eligiendoTexto} />;
    case "autorizando":
      return (
        <Espera
          nombre={estado.nombre}
          titulo={t.autorizandoTitulo}
          texto={t.autorizandoTexto}
        />
      );
    case "leyendo":
      return <Espera nombre={estado.nombre} titulo={t.leyendoTitulo} texto={t.leyendoTexto} />;
    case "listo":
      return (
        <Ficha_
          e={estado}
          volver={volverAlInicio}
          podar={(inicio) => {
            const { t: _t, ...resto } = estado;
            setEstado({ t: "podar", inicio, ...resto });
            window.scrollTo({ top: 0 });
          }}
        />
      );
    case "podar":
      return movilRef.current ? (
        <Podar
          movil={movilRef.current}
          ficha={estado.ficha}
          props={estado.props}
          inicio={estado.inicio}
          reiniciar={() => reiniciar(estado.ficha.nombre)}
          alSalir={() => {
            const { t: _t, inicio: _i, ...resto } = estado;
            setEstado({ t: "listo", ...resto, recuento: null });
            window.scrollTo({ top: 0 });
            if (movilRef.current) void recontar(movilRef.current);
          }}
        />
      ) : null;
    case "reiniciando":
      return <Reiniciando e={estado} />;
    case "desconectado":
      return (
        <section className="tarjeta">
          <p className="etiqueta">{t.desconectadoEtiqueta}</p>
          <h1 className="titulo t-l">{fmt(t.desconectadoTitulo, { nombre: estado.nombre })}</h1>
          <p className="lead">{t.desconectadoTexto}</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={conectarNuevo}>
              {t.conectarOtro}
            </button>
          </div>
        </section>
      );
    case "error":
      return (
        <section className="tarjeta">
          <p className="etiqueta error">{t.errorEtiqueta}</p>
          <h1 className="titulo t-l">{t.errorTitulo}</h1>
          <p className="lead">{estado.mensaje}</p>
          <p className="sub">{t.errorConsejo}</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={conectarNuevo}>
              {t.reintentar}
            </button>
          </div>
        </section>
      );
  }
}

function Espera({ titulo, texto, nombre }: { titulo: string; texto: string; nombre?: string }) {
  const { t } = useTextos();
  return (
    <section className="tarjeta" aria-live="polite">
      <div className="pulso" aria-hidden="true" />
      {nombre && <p className="etiqueta">{fmt(t.conectar.detectado, { nombre })}</p>}
      <h1 className="titulo t-l">{titulo}</h1>
      <p className="lead">{texto}</p>
    </section>
  );
}

function Ficha_({ e, volver, podar }: { e: Extract<Estado, { t: "listo" }>; volver: () => void; podar: (inicio: "perfil" | "restaurar") => void }) {
  const { idioma, t: textos } = useTextos();
  const t = textos.conectar;
  const f = e.ficha;
  const r = e.recuento;
  const [copiado, setCopiado] = useState(false);
  const fecha = f.parche ? new Date(f.parche + "T00:00:00").toLocaleDateString(textos.idioma.fecha, { year: "numeric", month: "long" }) : null;
  const tecnicos = CLAVES_TECNICAS.filter((k) => e.props[k]).map((k) => `${k} = ${e.props[k]}`);
  // La cifra principal solo cuenta lo que se puede quitar sin riesgo: es la que se comparte, así que no puede exagerar.
  const quitables = r ? r.porNivel.seguro : 0;
  const masAlla = r ? r.porNivel.avanzado + r.porNivel.experto : 0;

  return (
    <section className="tarjeta dos">
      <div className="col">
      {e.reiniciado && (
        <p className="arranco" role="status">
          {t.arranco}
        </p>
      )}
      <p className="etiqueta">{e.demo ? t.demo : t.reconocido}</p>
      <h1 className="titulo t-l">
        <em>{f.nombre}</em>
      </h1>
      <div className="chips">
        <span className="chip-claro fuerte">Android {f.android}</span>
        {f.capa && <span className="chip-claro">{capaEn(f.capa, idioma)}</span>}
        <span className="chip-claro">
          {f.fabricante} · {f.modelo}
        </span>
        {fecha && <span className="chip-claro">{fmt(t.parche, { fecha })}</span>}
        <span className="chip-claro">{f.wifiPosible ? t.wifi : t.soloCable}</span>
      </div>

      <div className="recuento">
        {r ? (
          <>
            {quitables === 0 && r.yaQuitados > 0 ? (
              <p className="grande">{rico(fmt(t.yaQuitadas, { n: r.yaQuitados }), idioma)}</p>
            ) : (
              <p className="grande">{rico(fmt(t.quitables, { n: quitables }), idioma)}</p>
            )}
            <p className="sub">
              {masAlla > 0 && fmt(t.masAlla, { n: masAlla })}
              {fmt(t.totales, { total: r.total, conocidas: r.conocidos })}
            </p>
            <ul className="niveles">
              {NIVELES.filter((n) => n !== "bloqueado").map((n) => (
                <li key={n} className={`nivel ${n}`}>
                  <span className="n">{r.porNivel[n]}</span>
                  <span>{t.nombreNivel[n as keyof typeof t.nombreNivel]}</span>
                </li>
              ))}
            </ul>
            <p className="sub">
              {t.porOrigen}{" "}
              {Object.entries(r.porOrigen)
                .sort((a, b) => b[1] - a[1])
                .map(([o, n]) => fmt(t.deOrigen, { n, origen: origenEn(o, idioma) }))
                .join(" · ") || t.ninguna}
              {r.yaQuitados ? ` · ${fmt(t.yaEstaban, { n: r.yaQuitados })}` : ""}
            </p>
            {r.porNivel.bloqueado > 0 && <p className="sub">{fmt(t.imprescindibles, { n: r.porNivel.bloqueado })}</p>}
          </>
        ) : (
          <p className="sub">{t.contando}</p>
        )}
      </div>
      </div>

      <div className="col">
      {r && quitables > 0 && <TarjetaResultado nombre={f.nombre} quitables={quitables} total={r.total} rom={f.romPersonalizada} />}

      {f.avisos.length > 0 && (
        <div className="avisos" role="note">
          <h2>{t.antesDeSeguir}</h2>
          <ul>
            {avisosFicha(f, idioma).map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="acciones">
        <button type="button" className="boton primario" disabled={!r} onClick={() => podar("perfil")}>
          {t.elegirPerfil}
        </button>
        <button type="button" className="boton" onClick={() => podar("restaurar")}>
          {t.restaurar}
        </button>
        {e.demo && (
          <button type="button" className="boton" onClick={volver}>
            {t.conectarMio}
          </button>
        )}
        <Link href={ruta(idioma, "/marcas/")} className="boton">
          {t.verMarcas}
        </Link>
      </div>

      <details className="tecnico">
        <summary>{t.tecnicos}</summary>
        <pre>{tecnicos.join("\n")}</pre>
        <button
          type="button"
          className="boton pequeno"
          onClick={() => {
            navigator.clipboard?.writeText(tecnicos.join("\n")).then(() => setCopiado(true), () => {});
          }}
        >
          {copiado ? t.copiado : t.copiar}
        </button>
      </details>
      </div>
    </section>
  );
}

function Reiniciando({ e }: { e: Extract<Estado, { t: "reiniciando" }> }) {
  const [, setTic] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTic((n) => n + 1), 5000);
    return () => clearInterval(t);
  }, []);
  const { idioma, t: textos } = useTextos();
  const t = textos.conectar;
  const tarda = Date.now() - e.desde > 4 * 60_000;
  return (
    <section className="tarjeta" aria-live="polite">
      <div className="pulso" aria-hidden="true" />
      <p className="etiqueta">{fmt(t.noDesconectes, { nombre: e.nombre })}</p>
      <h1 className="titulo t-l">{e.arrancando ? t.arrancando : t.reiniciando}</h1>
      <p className="lead">{e.arrancando ? t.arrancandoTexto : t.reiniciandoTexto}</p>
      {tarda && (
        <div className="avisos" role="note">
          <h2>{t.logoTitulo}</h2>
          <ul>
            <li>{t.logoArreglo}</li>
            <li>{rico(t.logoPasos, idioma)}</li>
          </ul>
        </div>
      )}
    </section>
  );
}
