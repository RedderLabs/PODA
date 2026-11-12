import { Cabecera, Pie } from "@/components/Logo";
import { Conectar } from "@/components/Conectar";
import { textosDe, type Idioma } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

export const metaConectar = (idioma: Idioma) => {
  const t = textosDe(idioma).conectar;
  return metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/conectar/" });
};

export function PaginaConectar({ idioma }: { idioma: Idioma }) {
  return (
    <>
      <Cabecera idioma={idioma} conNav={false} />
      <main className="herramienta">
        <Conectar />
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
