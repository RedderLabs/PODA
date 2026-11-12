"use client";
// Textos del idioma de la página para los componentes de cliente (conectar, limpiar, portada…).
// El layout de cada idioma los pone aquí; solo viaja al navegador el diccionario de ese idioma.
import { createContext, useContext, type ReactNode } from "react";
import type { Idioma } from "@/lib/rutas";
import type { Textos } from "@/textos/es";

const Contexto = createContext<{ idioma: Idioma; t: Textos } | null>(null);

export function ProveedorTextos({ idioma, t, children }: { idioma: Idioma; t: Textos; children: ReactNode }) {
  return <Contexto.Provider value={{ idioma, t }}>{children}</Contexto.Provider>;
}

export function useTextos() {
  const c = useContext(Contexto);
  if (!c) throw new Error("Falta <ProveedorTextos>.");
  return c;
}
