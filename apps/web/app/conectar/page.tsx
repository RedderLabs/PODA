import type { Metadata } from "next";
import { Cabecera, Pie } from "@/components/Logo";
import { Conectar } from "@/components/Conectar";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Conecta tu móvil y quita sus apps de serie",
  descripcion:
    "Conecta tu Android por cable: Poda reconoce el modelo y la versión, cuenta las apps de serie que se pueden quitar y las quita con copia de seguridad. Sin instalar nada.",
  ruta: "/conectar/",
});

export default function PaginaConectar() {
  return (
    <>
      <Cabecera conNav={false} />
      <main className="herramienta">
        <Conectar />
      </main>
      <Pie />
    </>
  );
}
