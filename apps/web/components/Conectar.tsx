"use client";
// Herramienta de conexión: reconoce el móvil por WebUSB y cuenta el bloatware. Solo lee: no cambia nada.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CLAVES_TECNICAS,
  contar,
  fichaDesdeProps,
  NIVELES,
  paquetesDe,
  parsearGetprop,
  type Ficha,
  type Recuento,
} from "@poda/nucleo";
import { TarjetaResultado } from "./Compartir";
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

const NOMBRE_NIVEL = { seguro: "seguras", avanzado: "avanzadas", experto: "para expertos" } as const;


export function Conectar() {
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
        else setEstado({ t: "error", mensaje: e instanceof Error ? e.message : String(e) });
      } finally {
        ocupado.current = false;
      }
    },
    [leerMovil],
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
        setEstado((e) => ({ t: "desconectado", nombre: e.t === "listo" ? e.ficha.nombre : "El móvil" }));
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
      return <Espera titulo="Un momento…" texto="Comprobando tu navegador." />;
    case "sin-webusb":
      return (
        <section className="tarjeta">
          <p className="etiqueta error">Navegador no compatible</p>
          <h1 className="titulo t-l">
            Abre Poda en <em>Chrome o Edge.</em>
          </h1>
          <p className="lead">
            Para hablar con el móvil por cable hace falta WebUSB, que solo tienen Chrome, Edge, Brave y Opera de ordenador. Firefox y Safari no lo
            incluyen, y desde un iPhone no se puede.
          </p>
          <div className="acciones">
            <button type="button" className="boton" onClick={verDemo}>
              Ver con un móvil de ejemplo
            </button>
          </div>
        </section>
      );
    case "inicio":
      return (
        <section className="tarjeta dos">
          <div className="col">
          <p className="etiqueta">Paso 1 · Conectar</p>
          <h1 className="titulo t-l">
            Conecta tu móvil <em>por cable.</em>
          </h1>
          <p className="lead">
            Poda reconoce el modelo y la versión de Android en cuanto lo conectas. Nada sale de tu ordenador y no se cambia nada sin que lo confirmes.
          </p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={conectarNuevo}>
              Conectar móvil
            </button>
            <button type="button" className="boton" onClick={verDemo}>
              Ver con un móvil de ejemplo
            </button>
          </div>
          </div>
          <div className="col">
          <ol className="pasos">
            <li>
              <strong>Activa las opciones de desarrollador. </strong>Ajustes → Información del teléfono → pulsa 7 veces en «Número de compilación» (en
              Xiaomi, en «Versión de MIUI» o «de HyperOS»).
            </li>
            <li>
              <strong>Activa «Depuración USB» </strong>en Ajustes → Opciones de desarrollador. En Xiaomi activa también «Depuración USB (ajustes de
              seguridad)».
            </li>
            <li>
              <strong>Conecta el cable. </strong>Que sea de datos, no solo de carga. Si el móvil pregunta qué hacer con el USB, elige «Transferencia de
              archivos».
            </li>
          </ol>
          </div>
        </section>
      );
    case "eligiendo":
      return <Espera titulo="Elige tu móvil" texto="En la ventana del navegador, selecciona tu móvil y pulsa «Conectar»." />;
    case "autorizando":
      return (
        <Espera
          nombre={estado.nombre}
          titulo="Mira la pantalla del móvil"
          texto="Acepta «¿Permitir depuración USB?» y marca «Permitir siempre desde este ordenador» para no repetirlo."
        />
      );
    case "leyendo":
      return <Espera nombre={estado.nombre} titulo="Leyendo tu móvil…" texto="Comprobando modelo, versión y apps instaladas." />;
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
          <p className="etiqueta">Desconectado</p>
          <h1 className="titulo t-l">{estado.nombre} se ha desconectado.</h1>
          <p className="lead">Vuelve a enchufarlo y Poda lo reconocerá solo.</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={conectarNuevo}>
              Conectar otro móvil
            </button>
          </div>
        </section>
      );
    case "error":
      return (
        <section className="tarjeta">
          <p className="etiqueta error">No se pudo conectar</p>
          <h1 className="titulo t-l">Algo no ha ido bien.</h1>
          <p className="lead">{estado.mensaje}</p>
          <p className="sub">Comprueba también que el cable es de datos y que aceptaste el aviso en la pantalla del móvil.</p>
          <div className="acciones">
            <button type="button" className="boton primario" onClick={conectarNuevo}>
              Reintentar
            </button>
          </div>
        </section>
      );
  }
}

function Espera({ titulo, texto, nombre }: { titulo: string; texto: string; nombre?: string }) {
  return (
    <section className="tarjeta" aria-live="polite">
      <div className="pulso" aria-hidden="true" />
      {nombre && <p className="etiqueta">Detectado: {nombre}</p>}
      <h1 className="titulo t-l">{titulo}</h1>
      <p className="lead">{texto}</p>
    </section>
  );
}

function Ficha_({ e, volver, podar }: { e: Extract<Estado, { t: "listo" }>; volver: () => void; podar: (inicio: "perfil" | "restaurar") => void }) {
  const f = e.ficha;
  const r = e.recuento;
  const [copiado, setCopiado] = useState(false);
  const fecha = f.parche ? new Date(f.parche + "T00:00:00").toLocaleDateString("es-ES", { year: "numeric", month: "long" }) : null;
  const tecnicos = CLAVES_TECNICAS.filter((k) => e.props[k]).map((k) => `${k} = ${e.props[k]}`);
  // La cifra principal solo cuenta lo que se puede quitar sin riesgo: es la que se comparte, así que no puede exagerar.
  const quitables = r ? r.porNivel.seguro : 0;
  const masAlla = r ? r.porNivel.avanzado + r.porNivel.experto : 0;

  return (
    <section className="tarjeta dos">
      <div className="col">
      {e.reiniciado && (
        <p className="arranco" role="status">
          El móvil ha arrancado bien después de la limpieza.
        </p>
      )}
      <p className="etiqueta">{e.demo ? "Móvil de ejemplo (modo demo)" : "Móvil reconocido"}</p>
      <h1 className="titulo t-l">
        <em>{f.nombre}</em>
      </h1>
      <div className="chips">
        <span className="chip-claro fuerte">Android {f.android}</span>
        {f.capa && <span className="chip-claro">{f.capa}</span>}
        <span className="chip-claro">
          {f.fabricante} · {f.modelo}
        </span>
        {fecha && <span className="chip-claro">Parche de seguridad: {fecha}</span>}
        <span className="chip-claro">{f.wifiPosible ? "Admite conexión por Wi‑Fi" : "Solo por cable"}</span>
      </div>

      <div className="recuento">
        {r ? (
          <>
            {quitables === 0 && r.yaQuitados > 0 ? (
              <p className="grande">
                <strong>{r.yaQuitados}</strong> apps ya quitadas: no queda nada seguro por quitar
              </p>
            ) : (
              <p className="grande">
                <strong>{quitables}</strong> apps de serie que puedes quitar sin riesgo
              </p>
            )}
            <p className="sub">
              {masAlla > 0 && <>Y {masAlla} más si quieres ir más lejos, con más cuidado. </>}
              De {r.total} apps instaladas, {r.conocidos} están en nuestra lista; las que no conocemos no se tocan.
            </p>
            <ul className="niveles">
              {NIVELES.filter((n) => n !== "bloqueado").map((n) => (
                <li key={n} className={`nivel ${n}`}>
                  <span className="n">{r.porNivel[n]}</span>
                  <span>{NOMBRE_NIVEL[n as keyof typeof NOMBRE_NIVEL]}</span>
                </li>
              ))}
            </ul>
            <p className="sub">
              Por origen:{" "}
              {Object.entries(r.porOrigen)
                .sort((a, b) => b[1] - a[1])
                .map(([o, n]) => `${n} de ${o}`)
                .join(" · ") || "ninguna"}
              {r.yaQuitados ? ` · ${r.yaQuitados} ya estaban quitadas` : ""}
            </p>
            {r.porNivel.bloqueado > 0 && <p className="sub">{r.porNivel.bloqueado} apps del sistema son imprescindibles: Poda no las tocará nunca.</p>}
          </>
        ) : (
          <p className="sub">Contando las apps del móvil…</p>
        )}
      </div>
      </div>

      <div className="col">
      {r && quitables > 0 && <TarjetaResultado nombre={f.nombre} quitables={quitables} total={r.total} rom={f.romPersonalizada} />}

      {f.avisos.length > 0 && (
        <div className="avisos" role="note">
          <h2>Antes de seguir</h2>
          <ul>
            {f.avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="acciones">
        <button type="button" className="boton primario" disabled={!r} onClick={() => podar("perfil")}>
          Elegir perfil y limpiar
        </button>
        <button type="button" className="boton" onClick={() => podar("restaurar")}>
          Restaurar una copia
        </button>
        {e.demo && (
          <button type="button" className="boton" onClick={volver}>
            Conectar el mío
          </button>
        )}
        <Link href={`/marcas/`} className="boton">
          Ver la lista por marca
        </Link>
      </div>

      <details className="tecnico">
        <summary>Detalles técnicos</summary>
        <pre>{tecnicos.join("\n")}</pre>
        <button
          type="button"
          className="boton pequeno"
          onClick={() => {
            navigator.clipboard?.writeText(tecnicos.join("\n")).then(() => setCopiado(true), () => {});
          }}
        >
          {copiado ? "Copiado" : "Copiar"}
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
  const tarda = Date.now() - e.desde > 4 * 60_000;
  return (
    <section className="tarjeta" aria-live="polite">
      <div className="pulso" aria-hidden="true" />
      <p className="etiqueta">{e.nombre} · no desconectes el cable</p>
      <h1 className="titulo t-l">{e.arrancando ? "Arrancando…" : "Reiniciando el móvil…"}</h1>
      <p className="lead">
        {e.arrancando
          ? "Ya responde. Esperando a que Android termine de arrancar."
          : "Puede tardar uno o dos minutos. Poda lo reconocerá solo en cuanto vuelva."}
      </p>
      {tarda && (
        <div className="avisos" role="note">
          <h2>¿Se ha quedado en el logo?</h2>
          <ul>
            <li>Tiene arreglo y no hace falta borrar nada.</li>
            <li>
              Sigue los pasos de <Link href="/rescate/">cómo recuperarlo</Link>: necesitarás el archivo de copia que se descargó al limpiar.
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
