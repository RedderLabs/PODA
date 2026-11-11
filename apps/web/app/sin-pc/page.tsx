import type { Metadata } from "next";
import Link from "next/link";
import { AVISO_PODA, PROTEGIDOS } from "@poda/nucleo";
import { Cabecera, Pie } from "@/components/Logo";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Quitar el bloatware de Android sin ordenador",
  descripcion:
    "Cómo quitar las apps de serie de un Android 11 o superior desde el propio móvil, sin PC ni root, con Shizuku y Canta. Y la lista de Poda de lo que no debes quitar.",
  ruta: "/sin-pc/",
});

const PASOS: { titulo: string; texto: React.ReactNode }[] = [
  {
    titulo: "Activa las opciones de desarrollador",
    texto: (
      <>
        Ajustes → Información del teléfono → pulsa 7 veces en «Número de compilación» (en Xiaomi, en «Versión de MIUI» o «de HyperOS»). Conéctate a una red Wi‑Fi: la
        depuración inalámbrica la necesita aunque no uses internet.
      </>
    ),
  },
  {
    titulo: "Instala Shizuku",
    texto: (
      <>
        Es gratuita y de código abierto. Está en Google Play y en{" "}
        <a href="https://github.com/RikkaApps/Shizuku" rel="noopener">
          su página de GitHub
        </a>
        . Hace de «ordenador» dentro del propio móvil.
      </>
    ),
  },
  {
    titulo: "Empareja Shizuku con el móvil",
    texto: (
      <>
        En Shizuku, elige <strong>Iniciar mediante depuración inalámbrica → Emparejamiento</strong>. Abre Ajustes → Opciones de desarrollador → Depuración inalámbrica →
        «Vincular dispositivo con código» y escribe el código en la notificación de Shizuku. Vuelve a Shizuku y pulsa <strong>Iniciar</strong>.
      </>
    ),
  },
  {
    titulo: "Instala Canta y dale permiso",
    texto: (
      <>
        <a href="https://github.com/samolego/Canta" rel="noopener">
          Canta
        </a>{" "}
        es la app que quita las apps. Al abrirla te pide acceso a Shizuku: acéptalo.
      </>
    ),
  },
  {
    titulo: "Quita solo lo que reconozcas",
    texto: (
      <>
        Canta marca cada app con su nivel de riesgo. Empieza por las recomendadas y, antes de quitar nada, comprueba que no está en la lista de abajo. Quita pocas cada vez.
      </>
    ),
  },
  {
    titulo: "Prueba antes de reiniciar",
    texto: <>Haz una llamada, escribe algo con el teclado y pon una alarma. Si algo falla, reinstala esa app desde Canta antes de reiniciar el móvil.</>,
  },
];

export default function SinPc() {
  return (
    <>
      <Cabecera />
      <main className="contenedor seccion" style={{ paddingTop: 40 }}>
        <p className="etiqueta">Sin ordenador · Android 11 o superior</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          Desde el propio <em>móvil.</em>
        </h1>
        <p className="lead" style={{ maxWidth: 780 }}>
          Desde Android 11, el móvil puede conectarse a sí mismo por depuración inalámbrica, como si fuera el ordenador. Con dos apps gratuitas, Shizuku y Canta, puedes quitar
          las apps de serie sin cable, sin PC y sin root.
        </p>
        <p className="sub" style={{ maxWidth: 780, marginTop: 12 }}>
          Poda no es ninguna de esas apps ni está relacionada con ellas. Lo que aporta aquí es su lista de lo que no se debe quitar, la misma que usa la web.{" "}
          <strong>¿Android 10 o anterior?</strong> Usa <Link href="/conectar/">Poda con cable</Link>.
        </p>

        <ol className="sinpc-pasos">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="caja">
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <h2>{p.titulo}</h2>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>

        <section className="sinpc-lista" aria-labelledby="no-quitar">
          <div className="seccion-cab" style={{ marginBottom: 24 }}>
            <h2 id="no-quitar" className="titulo t-l" style={{ margin: 0 }}>
              Lo que <em>no debes quitar.</em>
            </h2>
            <p className="lead">
              Aunque otra herramienta lo marque como seguro. Es la lista que Poda aplica siempre. También en{" "}
              <a href="/protegidas.json" className="mono">
                protegidas.json
              </a>{" "}
              para otras herramientas.
            </p>
          </div>

          <div className="rejilla r2">
            {PROTEGIDOS.map((g) => (
              <details key={g.titulo} className="caja protegidos">
                <summary>
                  <span>
                    <strong>{g.titulo}</strong>
                    <span className="sub">{g.motivo}</span>
                  </span>
                  <span className="mono protegidos-n">{g.paquetes.length + (g.familias?.length ?? 0)}</span>
                </summary>
                <ul>
                  {g.paquetes.map((p) => (
                    <li key={p}>
                      <code>{p}</code>
                    </li>
                  ))}
                  {g.familias?.map((f) => (
                    <li key={f.texto} className="familia">
                      {f.texto}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <details className="caja protegidos con-cuidado">
              <summary>
                <span>
                  <strong>Con cuidado: las que usas a diario</strong>
                  <span className="sub">Se pueden quitar, pero solo si tienes otra que haga lo mismo.</span>
                </span>
                <span className="mono protegidos-n">{Object.keys(AVISO_PODA).length}</span>
              </summary>
              <ul>
                {Object.entries(AVISO_PODA).map(([p, aviso]) => (
                  <li key={p}>
                    <code>{p}</code>
                    <span className="sub">{aviso}</span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </section>

        <div className="cta" style={{ marginTop: 56 }}>
          <h2 className="titulo" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, margin: 0 }}>
            ¿Se ha quedado <em>en el logo?</em>
          </h2>
          <div className="acciones">
            <Link href="/rescate/" className="boton primario">
              Cómo recuperarlo
            </Link>
            <Link href="/conectar/" className="boton oscuro">
              Usar Poda con cable
            </Link>
          </div>
        </div>
      </main>
      <Pie />
    </>
  );
}
