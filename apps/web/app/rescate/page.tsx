import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera, Pie } from "@/components/Logo";
import { metaPagina } from "@/lib/seo";

export const metadata: Metadata = metaPagina({
  titulo: "Mi móvil se queda en el logo después de quitar apps: cómo recuperarlo",
  descripcion:
    "Si tras quitar apps preinstaladas el móvil Android no termina de arrancar, se puede recuperar sin perder datos: por cable con ADB o desde el recovery (TWRP o LineageOS).",
  ruta: "/rescate/",
});

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

export default function Rescate() {
  return (
    <>
      <Cabecera />
      <main className="contenedor seccion rescate" style={{ paddingTop: 40 }}>
        <p className="etiqueta">Rescate</p>
        <h1 className="titulo t-l" style={{ margin: "14px 0 18px" }}>
          ¿Se queda en <em>el logo?</em>
        </h1>
        <p className="lead" style={{ maxWidth: 760 }}>
          Tiene arreglo y no hace falta borrar nada. Quitar una app «para tu usuario» no la borra del sistema: Android solo apunta que está quitada. Basta con devolverla, o con
          hacer que Android olvide esa nota.
        </p>
        <p className="sub" style={{ maxWidth: 760, marginTop: 12 }}>
          <strong>No elijas «Factory reset» ni «Wipe data»</strong> en el recovery: eso sí borra fotos, apps y ajustes. Déjalo como último recurso.
        </p>

        <div className="rejilla r2" style={{ marginTop: 40 }}>
          <section className="caja">
            <span className="num">Opción 1 · con el cable</span>
            <h2 className="titulo" style={{ fontSize: 28, margin: 0 }}>
              Devolver las apps desde la copia
            </h2>
            <p className="sub">
              Funciona si el ordenador ve el móvil mientras está en el logo. Necesitas{" "}
              <a href="https://developer.android.com/tools/releases/platform-tools" rel="noopener">
                las platform-tools de Android
              </a>{" "}
              y el archivo <span className="mono">poda-copia-….json</span> que se descargó al limpiar. Cierra antes la pestaña de Poda.
            </p>
            <ol className="pasos">
              <li>
                Con el móvil en el logo y conectado, escribe <span className="mono">adb devices</span>. Debe salir el número de serie seguido de{" "}
                <span className="mono">device</span>.
              </li>
              <li>Pega esto cambiando la ruta por la de tu copia:</li>
            </ol>
            <p className="etiqueta">Windows (PowerShell)</p>
            <pre className="codigo">{PS_RESTAURAR}</pre>
            <p className="etiqueta">Mac o Linux (necesita jq)</p>
            <pre className="codigo">{SH_RESTAURAR}</pre>
            <p className="sub">Si sale «Can&apos;t find service: package», el sistema aún no está listo: espera un minuto y repite.</p>
          </section>

          <section className="caja">
            <span className="num">Opción 2 · desde el recovery</span>
            <h2 className="titulo" style={{ fontSize: 28, margin: 0 }}>
              Hacer que Android olvide lo quitado
            </h2>
            <p className="sub">
              Si el ordenador no ve el móvil en el logo. Funciona con TWRP o con el recovery de LineageOS si tienen ADB y el almacenamiento no está cifrado (o TWRP te deja
              descifrarlo con tu PIN).
            </p>
            <ol className="pasos">
              <li>Apaga el móvil manteniendo Encendido 15 segundos. Luego mantén Volumen arriba + Encendido hasta que salga el recovery.</li>
              <li>
                En TWRP: <strong>Mount</strong> y marca <strong>Data</strong>. En el de LineageOS: <strong>Advanced → Enable ADB</strong>.
              </li>
              <li>
                En el ordenador, <span className="mono">adb devices</span> debe mostrar <span className="mono">recovery</span>. Entonces:
              </li>
            </ol>
            <pre className="codigo">{RECOVERY}</pre>
            <p className="sub">
              Todas las apps vuelven a estar instaladas. Se pierden las apps elegidas por defecto (navegador, teclado…), que el móvil te volverá a preguntar. En TWRP también
              puedes hacerlo sin ordenador: Advanced → File Manager → data/system/users/0 y renombra el archivo.
            </p>
          </section>
        </div>

        <p className="sub" style={{ marginTop: 40 }}>
          ¿Te ha pasado con Poda? Cuéntanos qué perfil usaste y en qué móvil para sacar esa app de los perfiles. <Link href="/conectar/">Volver a Poda</Link>.
        </p>
      </main>
      <Pie />
    </>
  );
}
