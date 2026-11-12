"use client";
// Tarjeta de resultado para compartir: el motor de viralidad de Poda.
import { useState } from "react";
import { Robot } from "./Robot";
import { useTextos } from "./Textos";
import { fmt, ruta } from "@/lib/rutas";

export function TarjetaResultado({ nombre, quitables, total, rom }: { nombre: string; quitables: number; total: number; rom?: string | null }) {
  const { idioma, t: textos } = useTextos();
  const t = textos.compartir;
  const [estado, setEstado] = useState<"" | "copiado" | "compartido" | "sin-portapapeles">("");
  // La portada en el idioma de la página, para que quien lo reciba la lea en el mismo idioma.
  const url = (typeof window !== "undefined" ? window.location.origin : "https://podamovil.com") + ruta(idioma, "/");
  const datos = { nombre, n: quitables, total, rom: rom ?? "" };
  const texto = fmt(rom ? t.textoRom : t.texto, datos);

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
          {t.etiqueta}
        </p>
        <p className="resultado-cifra">
          <span className="ah-recuadro oscuro">{fmt(t.apps, datos)}</span> {rom ? t.queSobran : t.deSerie}
        </p>
        <p className="resultado-sub">
          {fmt(rom ? t.subRom : t.sub, datos)}
        </p>
        <div className="acciones">
          <button type="button" className="boton primario" onClick={compartir}>
            {estado === "copiado" ? t.copiado : estado === "compartido" ? t.compartido : t.boton}
          </button>
        </div>
        {(estado === "copiado" || estado === "sin-portapapeles") && (
          <div className="resultado-redes">
            {estado === "sin-portapapeles" && <p className="resultado-sub">{fmt(t.copiaTexto, { texto: mensaje })}</p>}
            <p className="resultado-sub">{t.enRedes}</p>
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
