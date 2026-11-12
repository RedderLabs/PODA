import Link from "next/link";
import { ruta, textosDe, type Idioma } from "@/lib/i18n";
import { REPO, WEB_REDDER, X_REDDER } from "@/lib/seo";
import { enlaces, Icono, MenuPrincipal } from "./Navegacion";
import { rico } from "./Rico";
import { SelectorIdioma } from "./SelectorIdioma";

/** Logo de la cabecera y del pie: la cabeza del robot y PODA. */
function Marca({ idioma, className, aria }: { idioma: Idioma; className: string; aria: string }) {
  return (
    <Link href={ruta(idioma, "/")} className={className} aria-label={aria}>
      <span className="ah-logo-caja" aria-hidden="true">
        <i />
        <i />
      </span>
      PODA
    </Link>
  );
}

export function Cabecera({ idioma, conNav = true }: { idioma: Idioma; conNav?: boolean }) {
  const t = textosDe(idioma).nav;
  return (
    <header className="ah-nav">
      <Marca idioma={idioma} className="ah-logo" aria={t.inicio} />
      {conNav ? <MenuPrincipal idioma={idioma} t={t} /> : <span className="ah-menu" aria-hidden="true" />}
      <Link href={ruta(idioma, "/conectar/")} className="ah-lanzar">
        <span aria-hidden="true">••</span> {t.conectar}
      </Link>
    </header>
  );
}

/**
 * Pie fijo abajo. En escritorio: marca, significado de PODA y firma, con la misma rejilla que la cabecera.
 * En el móvil, donde la cabecera no tiene menú, muestra los enlaces. El selector de idioma va en la firma.
 */
export function Pie({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma);
  return (
    <footer className="pie">
      <Marca idioma={idioma} className="pie-marca" aria={t.nav.inicio} />
      <div className="pie-centro">
        <span className="pie-acronimo">{rico(t.pie.acronimo, idioma, "b")}</span>
        <nav className="pie-enlaces" aria-label={t.pie.aria}>
          {enlaces(idioma, t.nav).map((e) => (
            <Link key={e.href} href={e.href} aria-label={e.texto} title={e.texto}>
              <Icono nombre={e.clave} tamano={22} />
              <span>{e.corto}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="pie-firma">
        <span className="pie-navegadores">{t.pie.navegadores}</span>
        <SelectorIdioma />
        <a href={REPO} rel="noopener" className="pie-red">
          GitHub
        </a>
        <a href={X_REDDER} rel="noopener" className="pie-red" aria-label={t.pie.enX}>
          X
        </a>
        <span>
          {t.pie.producto}{" "}
          <a href={WEB_REDDER} rel="noopener">
            Redder Labs
          </a>
        </span>
      </div>
    </footer>
  );
}
