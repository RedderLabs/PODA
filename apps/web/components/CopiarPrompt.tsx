"use client";
import { useState } from "react";

export function CopiarPrompt({ texto }: { texto: string }) {
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
      {estado === "copiado" ? "Copiado" : estado === "fallo" ? "Selecciónalo y cópialo" : "Copiar prompt"}
    </button>
  );
}
