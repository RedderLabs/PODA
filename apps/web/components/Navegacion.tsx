// Enlaces principales de Poda con sus iconos: los usan el menú de la cabecera (escritorio)
// y la barra del pie (móvil), para que siempre sean los mismos.
import Link from "next/link";

/** Iconos de trazo para la barra del pie en el móvil (dibujados para Poda). */
export const ICONO = {
  como: (
    <>
      <path d="M9 3v5M15 3v5" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
      <path d="M12 17v4" />
    </>
  ),
  marcas: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  perfiles: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  claude: (
    <>
      <path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
    </>
  ),
  sinpc: (
    <>
      <path d="M3 9.5a13 13 0 0 1 18 0" />
      <path d="M6 13a8.5 8.5 0 0 1 12 0" />
      <path d="M9 16.5a4 4 0 0 1 6 0" />
      <path d="M12 20h.01" />
    </>
  ),
  preguntas: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.4" />
      <path d="M12 17h.01" />
    </>
  ),
};

/** Los mismos enlaces que el menú de la cabecera. En el móvil, el pie los muestra con icono. */
export const ENLACES: { href: string; texto: string; corto: string; icono: keyof typeof ICONO }[] = [
  { href: "/#como", texto: "Cómo funciona", corto: "Cómo", icono: "como" },
  { href: "/marcas/", texto: "Marcas", corto: "Marcas", icono: "marcas" },
  { href: "/#perfiles", texto: "Perfiles", corto: "Perfiles", icono: "perfiles" },
  { href: "/#claude", texto: "Con Claude", corto: "Claude", icono: "claude" },
  { href: "/sin-pc/", texto: "Sin ordenador", corto: "Sin PC", icono: "sinpc" },
  { href: "/#faq", texto: "Preguntas", corto: "Dudas", icono: "preguntas" },
];

export function Icono({ nombre, tamano = 18 }: { nombre: keyof typeof ICONO; tamano?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={tamano} height={tamano} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONO[nombre]}
    </svg>
  );
}

/** Menú de la cabecera en escritorio: icono y texto. */
export function MenuPrincipal() {
  return (
    <nav className="ah-menu" aria-label="Principal">
      {ENLACES.map((e) => (
        <Link key={e.href} href={e.href}>
          <Icono nombre={e.icono} tamano={16} />
          {e.texto}
        </Link>
      ))}
    </nav>
  );
}
