import { Cabecera, Pie } from "@/components/Logo";
import { rico } from "@/components/Rico";
import { textosDe, type Idioma } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

export const metaRescate = (idioma: Idioma) => {
  const t = textosDe(idioma).rescate;
  return metaPagina({ idioma, titulo: t.metaTitulo, descripcion: t.metaDescripcion, r: "/rescate/" });
};

// Los comandos no se traducen: son los mismos en cualquier idioma.
const PS_RESTAURAR = `$c = Get-Content "$HOME\\Downloads\\poda-copia-….json" -Raw | ConvertFrom-Json
$c.paquetes.PSObject.Properties |
  Where-Object { $_.Value -eq "instalado" -and $_.Name -like "*.*" } |
  ForEach-Object { adb shell cmd package install-existing --user 0 $_.Name; adb shell pm enable --user 0 $_.Name }
adb reboot`;

const SH_RESTAURAR = `jq -r '.paquetes | to_entries[] | select(.value=="instalado") | .key' poda-copia-….json |
  while read p; do adb shell cmd package install-existing --user 0 "$p"; adb shell pm enable --user 0 "$p"; done
adb reboot`;

const RECOVERY = `adb shell cp /data/system/users/0/package-restrictions.xml /data/system/users/0/package-restrictions.xml.poda-bak
adb shell rm /data/system/users/0/package-restrictions.xml
adb reboot`;

export function Rescate({ idioma }: { idioma: Idioma }) {
  const t = textosDe(idioma).rescate;
  const r = (x: string) => rico(x, idioma);
  return (
    <>
      <Cabecera idioma={idioma} />
      <main className="contenedor seccion rescate" style={{ paddingTop: 40 }}>
        <p className="etiqueta">{t.etiqueta}</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          {r(t.titulo)}
        </h1>
        <p className="lead" style={{ maxWidth: 760 }}>
          {t.lead}
        </p>
        <p className="sub" style={{ maxWidth: 760, marginTop: 12 }}>
          {r(t.aviso)}
        </p>

        <div className="rejilla r2" style={{ marginTop: 40 }}>
          <section className="caja">
            <span className="num">{t.op1Etiqueta}</span>
            <h2 className="titulo" style={{ fontSize: 28, margin: 0 }}>
              {t.op1Titulo}
            </h2>
            <p className="sub">{r(t.op1Texto)}</p>
            <ol className="pasos">
              {t.op1Pasos.map((p) => (
                <li key={p}>{r(p)}</li>
              ))}
            </ol>
            <p className="etiqueta">{t.windows}</p>
            <pre className="codigo">{PS_RESTAURAR}</pre>
            <p className="etiqueta">{t.macLinux}</p>
            <pre className="codigo">{SH_RESTAURAR}</pre>
            <p className="sub">{t.noListo}</p>
          </section>

          <section className="caja">
            <span className="num">{t.op2Etiqueta}</span>
            <h2 className="titulo" style={{ fontSize: 28, margin: 0 }}>
              {t.op2Titulo}
            </h2>
            <p className="sub">{t.op2Texto}</p>
            <ol className="pasos">
              {t.op2Pasos.map((p) => (
                <li key={p}>{r(p)}</li>
              ))}
            </ol>
            <pre className="codigo">{RECOVERY}</pre>
            <p className="sub">{t.op2Despues}</p>
          </section>
        </div>

        <p className="sub" style={{ marginTop: 40 }}>
          {r(t.cuentanos)}
        </p>
      </main>
      <Pie idioma={idioma} />
    </>
  );
}
