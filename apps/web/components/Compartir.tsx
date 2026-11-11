"use client";
// Tarjeta de resultado para compartir: el motor de viralidad de Poda.
import { useState } from "react";
import { Robot } from "./Robot";

export function TarjetaResultado({ nombre, quitables, total, rom }: { nombre: string; quitables: number; total: number; rom?: string | null }) {
  const [estado, setEstado] = useState<"" | "copiado" | "compartido">("");
  const url = typeof window !== "undefined" ? window.location.origin : "https://podamovil.com";
  const texto = rom
    ? `Mi ${nombre} con ${rom} solo tiene ${quitables} apps que sobran. ¿Cuántas trae el tuyo? Míralo con Poda, sin instalar nada:`
    : `Mi ${nombre} traía ${quitables} apps de serie que se pueden quitar sin riesgo (de ${total} instaladas). Míralo en el tuyo con Poda, sin instalar nada:`;

  const compartir = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Poda", text: texto, url });
        setEstado("compartido");
        return;
      }
    } catch {
      return; // cancelado por el usuario
    }
    try {
      await navigator.clipboard.writeText(`${texto} ${url}`);
      setEstado("copiado");
    } catch {
      /* sin portapapeles: el texto sigue visible para copiarlo a mano */
    }
  };

  return (
    <div className="resultado">
      <div className="resultado-robot" aria-hidden="true">
        <Robot expresion="agobio" pantalla={`${quitables} APPS`} pedestal={false} seguirRaton={false} />
      </div>
      <div className="resultado-texto">
        <p className="etiqueta" style={{ color: "#a7a196" }}>
          Resultado
        </p>
        <p className="resultado-cifra">
          <span className="ah-recuadro oscuro">{quitables} apps</span> {rom ? "que sobran" : "de serie"}
        </p>
        <p className="resultado-sub">
          {rom
            ? `Con ${rom} tu ${nombre} ya viene ligero. ¿Y el de tus amigos, con el sistema de fábrica?`
            : `Tu ${nombre} trae ${quitables} apps que no pediste y que puedes quitar sin riesgo. ¿Y el de tus amigos?`}
        </p>
        <div className="acciones">
          <button type="button" className="boton primario" onClick={compartir}>
            {estado === "copiado" ? "Copiado, pégalo donde quieras" : estado === "compartido" ? "¡Compartido!" : "Compartir resultado"}
          </button>
        </div>
      </div>
    </div>
  );
}
