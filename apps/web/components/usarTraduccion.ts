"use client";
// Descripciones de la lista en el idioma de la web, con el traductor del navegador (specs/007).
import { useCallback, useEffect, useRef, useState } from "react";
import type { Idioma } from "@poda/nucleo";
import {
  crearTraductor,
  disponibilidad,
  guardarTraducciones,
  leerTraducciones,
  traducirPendientes,
  type EstadoTraduccion,
  type Traductor,
} from "@/lib/traducir";

/** `textos`: las descripciones originales que se están mostrando. */
export function useTraduccion(idioma: Idioma, textos: readonly string[]) {
  const [estado, setEstado] = useState<EstadoTraduccion | "descargando">("sin-traductor");
  const [hechas, setHechas] = useState<Record<string, string>>({});
  const hechasRef = useRef(hechas);
  hechasRef.current = hechas;
  const traductor = useRef<Traductor | null>(null);

  useEffect(() => {
    let vivo = true;
    traductor.current = null;
    setHechas(leerTraducciones(idioma));
    disponibilidad(idioma).then((d) => vivo && setEstado(d));
    return () => {
      vivo = false;
    };
  }, [idioma]);

  const clave = textos.join("\u0000");
  useEffect(() => {
    if (estado !== "lista") return;
    let vivo = true;
    (async () => {
      traductor.current ??= await crearTraductor(idioma);
      const t = traductor.current;
      if (!vivo) return;
      if (!t) return setEstado("sin-traductor");
      await traducirPendientes(
        t,
        textos,
        hechasRef.current,
        (original, traducido) =>
          setHechas((h) => {
            const n = { ...h, [original]: traducido };
            guardarTraducciones(idioma, n);
            return n;
          }),
        () => vivo,
      );
    })();
    return () => {
      vivo = false;
    };
    // `clave` resume `textos`: así no se relanza en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, idioma, clave]);

  /** Desde un clic: Chrome solo deja descargar el idioma con un gesto del usuario. */
  const activar = useCallback(async () => {
    setEstado("descargando");
    const t = await crearTraductor(idioma);
    traductor.current = t;
    setEstado(t ? "lista" : "sin-traductor");
  }, [idioma]);

  const traducida = useCallback((original: string) => hechas[original], [hechas]);
  return { estado, traducida, activar };
}
