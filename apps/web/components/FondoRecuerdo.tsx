"use client";
// Fondo de recuerdo (specs/010): oferta opcional al final de los resultados. No cambia el fondo del móvil:
// solo deja la imagen en la galería cuando la persona pulsa el botón, y explica cómo ponerla.
import { useState } from "react";
import { FONDO, marcaFondo, TEXTOS_NUCLEO, type Familia } from "@poda/nucleo";
import { dejarFondo, type Movil } from "@/lib/conexion";
import { useTextos } from "./Textos";

export function FondoRecuerdo({ movil, familia }: { movil: Movil; familia: Familia }) {
  const { idioma, t: textos } = useTextos();
  const t = textos.fondo;
  const tn = TEXTOS_NUCLEO[idioma].fondo;
  const [estado, setEstado] = useState<"" | "copiando" | "listo" | "fallo">("");

  const guardar = async () => {
    setEstado("copiando");
    try {
      await dejarFondo(movil);
      setEstado("listo");
    } catch {
      setEstado("fallo"); // R-002 CA-3: una frase y sin reintentar solo
    }
  };

  return (
    <section className="fondo-recuerdo" aria-live="polite">
      {/* eslint-disable-next-line @next/next/no-img-element -- web estática: la imagen ya sale del tamaño justo */}
      <img className="fondo-recuerdo-img" src={`/${FONDO.archivo}`} alt={t.alt} width={FONDO.ancho / 16} height={FONDO.alto / 16} loading="lazy" />
      <div className="fondo-recuerdo-texto">
        <p className="etiqueta">{t.etiqueta}</p>
        <h2>{t.titulo}</h2>
        <p className="sub">{t.texto}</p>
        {estado === "listo" ? (
          <>
            <p className="sub">{t.listo}</p>
            <ol className="fondo-recuerdo-pasos">
              {tn.pasos[marcaFondo(familia)].map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p className="sub">{tn.noAparece}</p>
            <p className="sub">{tn.borrar}</p>
          </>
        ) : (
          <>
            {estado === "fallo" && <p className="sub">{t.fallo}</p>}
            {estado !== "fallo" && (
              <div className="acciones">
                <button type="button" className="boton" onClick={guardar} disabled={estado === "copiando"}>
                  {estado === "copiando" ? t.copiando : t.boton}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
