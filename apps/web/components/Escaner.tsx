import { MOVILES_ESCANER } from "@/lib/contenido";

// La fila se repite cuatro veces: la animación desplaza la mitad y vuelve a empezar sin salto.
const fila = [...MOVILES_ESCANER, ...MOVILES_ESCANER, ...MOVILES_ESCANER, ...MOVILES_ESCANER];
const ICONOS = Array.from({ length: 8 });

export function Escaner() {
  return (
    <section className="escaner" aria-label="Antes y después de pasar por Poda">
      <div className="escaner-chips" aria-hidden="true">
        <span>De serie</span>
        <span>Tras Poda</span>
      </div>
      <div className="escaner-pista">
        <div className="escaner-capa antes" aria-hidden="true">
          <div className="escaner-fila">
            {fila.map((m, i) => (
              <div className="tarjeta-codigo" key={i}>
                <b>$ adb shell pm list packages</b>
                <i>
                  // {m.marca} · {m.capa}
                </i>
                {m.paquetes.map((p) => (
                  <span key={p}>package:{p}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="escaner-capa despues">
          <div className="escaner-fila">
            {fila.map((m, i) => (
              <div className="tarjeta-limpia" key={i} aria-hidden={i >= MOVILES_ESCANER.length}>
                <div className="cab">
                  <span>{m.marca}</span>
                  <span>perfil recomendado</span>
                </div>
                <div className="iconos" aria-hidden="true">
                  {ICONOS.map((_, j) => (
                    <span key={j} />
                  ))}
                </div>
                <div>
                  <p className="cifra">{m.paquetes.length} apps fuera.</p>
                  <p className="sub">Solo lo que usas. Todo reversible.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="escaner-brillo" aria-hidden="true" />
        <div className="escaner-haz" aria-hidden="true" />
      </div>
    </section>
  );
}
