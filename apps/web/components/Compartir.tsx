"use client";
// Tarjeta de resultado para compartir: el motor de viralidad de Poda.
import { useState } from "react";
import { Robot } from "./Robot";

export function TarjetaResultado({ nombre, quitables, total, rom }: { nombre: string; quitables: number; total: number; rom?: string | null }) {
  const [estado, setEstado] = useState<"" | "copiado" | "compartido" | "sin-portapapeles">("");
  const url = typeof window !== "undefined" ? window.location.origin : "https://podamovil.com";
  const texto = rom
    ? `Mi ${nombre} con ${rom} solo tiene ${quitables} apps que sobran. ¿Cuántas trae el tuyo? Míralo con Poda, sin instalar nada:`
    : `Mi ${nombre} traía ${quitables} apps de serie que se pueden quitar sin riesgo (de ${total} instaladas). Míralo en el tuyo con Poda, sin instalar nada:`;

  const mensaje = `${texto} ${url}`;
  const redes = [
    { nombre: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(mensaje)}` },
    { nombre: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}` },
    { nombre: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(mensaje)}` },
  ];

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensaje);
      setEstado("copiado");
    } catch {
      setEstado("sin-portapapeles"); // el texto se muestra para copiarlo a mano
    }
  };

  const compartir = async () => {
    // En el ordenador, la ventana de compartir de Windows se cierra a menudo sola y el navegador lo da por
    // cancelado. Ahí se copia el texto y se ofrecen las redes. El menú del sistema solo se usa en el móvil.
    const tactil = window.matchMedia("(pointer: coarse)").matches;
    if (tactil && navigator.share) {
      try {
        await navigator.share({ title: "Poda", text: texto, url });
        setEstado("compartido");
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // cerrado por el usuario
      }
    }
    await copiar();
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
        {(estado === "copiado" || estado === "sin-portapapeles") && (
          <div className="resultado-redes">
            {estado === "sin-portapapeles" && <p className="resultado-sub">Copia este texto: {mensaje}</p>}
            <p className="resultado-sub">O compártelo directamente en:</p>
            <div className="acciones">
              {redes.map((r) => (
                <a key={r.nombre} className="boton pequeno oscuro" href={r.href} target="_blank" rel="noopener noreferrer">
                  {r.nombre}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
