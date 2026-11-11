import Link from "next/link";
import { ACRONIMO, REPO, WEB_REDDER, X_REDDER } from "@/lib/seo";
import { ENLACES, Icono, MenuPrincipal } from "./Navegacion";

export function Logo() {
  return (
    <Link href="/" className="logo">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M6 3v18" />
        <path d="M6 8c4 0 6-2 7-5" />
        <path d="M6 14c5 0 8-2 10-6" />
        <circle cx="18" cy="18" r="3" />
      </svg>
      Poda
    </Link>
  );
}

export function Cabecera({ conNav = true }: { conNav?: boolean }) {
  return (
    <header className="ah-nav">
      <Link href="/" className="ah-logo" aria-label="Poda, inicio">
        <span className="ah-logo-caja" aria-hidden="true">
          <i />
          <i />
        </span>
        PODA
      </Link>
      {conNav ? (
        <MenuPrincipal />
      ) : (
        <span className="ah-menu" aria-hidden="true" />
      )}
      <Link href="/conectar/" className="ah-lanzar">
        <span aria-hidden="true">••</span> Conectar móvil
      </Link>
    </header>
  );
}

/** «Programa para Ocultar…» con las iniciales de PODA resaltadas. */
function Acronimo() {
  return (
    <span className="pie-acronimo">
      {ACRONIMO.split(" ").map((p, i) =>
        /^[PODA]/.test(p) && ["Programa", "Ocultar", "Desactivar", "Apps"].includes(p) ? (
          <span key={i}>
            <b>{p[0]}</b>
            {p.slice(1)}{" "}
          </span>
        ) : (
          <span key={i}>{p} </span>
        ),
      )}
    </span>
  );
}

/**
 * Pie fijo abajo. En escritorio: marca, significado de PODA y firma, con la misma rejilla que la cabecera.
 * En el móvil, donde la cabecera no tiene menú, muestra los enlaces.
 */
export function Pie() {
  return (
    <footer className="pie">
      <Link href="/" className="pie-marca" aria-label="Poda, inicio">
        <span className="ah-logo-caja" aria-hidden="true">
          <i />
          <i />
        </span>
        PODA
      </Link>
      <div className="pie-centro">
        <Acronimo />
        <nav className="pie-enlaces" aria-label="Pie de página">
          {ENLACES.map((e) => (
            <Link key={e.href} href={e.href} aria-label={e.texto} title={e.texto}>
              <Icono nombre={e.icono} tamano={22} />
              <span>{e.corto}</span>
            </Link>
          ))}
        </nav>
      </div>
      <p className="pie-firma">
        <span className="pie-navegadores">Chrome · Edge · Brave · Opera</span>
        <a href={REPO} rel="noopener" className="pie-red">
          GitHub
        </a>
        <a href={X_REDDER} rel="noopener" className="pie-red" aria-label="Redder Labs en X">
          X
        </a>
        <span>
          Un producto de{" "}
          <a href={WEB_REDDER} rel="noopener">
            Redder Labs
          </a>
        </span>
      </p>
    </footer>
  );
}
