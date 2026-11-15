import { PROTEGIDOS, TEXTOS_NUCLEO, type Idioma } from "@poda/nucleo";

// Grupos de apps que Poda no quita nunca, en ningún perfil (packages/nucleo/src/protecciones.ts).
// Se usa en «Sin ordenador» y en /conectar (specs/004 R-005).
export function GruposProtegidos({ idioma }: { idioma: Idioma }) {
  const n = TEXTOS_NUCLEO[idioma];
  return (
    <>
      {PROTEGIDOS.map((g, i) => (
        <details key={g.titulo} className="caja protegidos">
          <summary>
            <span>
              <strong>{n.protegidos[i].titulo}</strong>
              <span className="sub">{n.protegidos[i].motivo}</span>
            </span>
            <span className="mono protegidos-n">{g.paquetes.length + (g.familias?.length ?? 0)}</span>
          </summary>
          <ul>
            {g.paquetes.map((p) => (
              <li key={p}>
                <code>{p}</code>
              </li>
            ))}
            {g.familias?.map((f, j) => (
              <li key={f.texto} className="familia">
                {n.protegidos[i].familias?.[j] ?? f.texto}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </>
  );
}
