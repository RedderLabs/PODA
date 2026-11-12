"use client";
import { useState } from "react";
import { useTextos } from "./Textos";

export function CopiarPrompt({ texto }: { texto: string }) {
  const { t } = useTextos();
  const [estado, setEstado] = useState<"listo" | "copiado" | "fallo">("listo");
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("fallo");
    }
  };
  return (
    <button type="button" className="boton oscuro pequeno" onClick={copiar}>
      {estado === "copiado" ? t.inicio.copiado : estado === "fallo" ? t.inicio.copiarFallo : t.inicio.copiar}
    </button>
  );
}
