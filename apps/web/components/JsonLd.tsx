// Datos estructurados para buscadores. Se escapa «<» para que el JSON no pueda cerrar la etiqueta <script>.
export function JsonLd({ datos }: { datos: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }} />;
}
