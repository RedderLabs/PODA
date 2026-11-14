import { Estadisticas, metaEstadisticas } from "@/paginas/Estadisticas";

export const metadata = metaEstadisticas("es");

export default function Pagina() {
  return <Estadisticas idioma="es" />;
}
