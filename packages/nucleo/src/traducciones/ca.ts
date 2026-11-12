// Textos del núcleo en catalán. Mismas claves y mismo orden que el español (ver ../idiomas.ts).
import type { TextosNucleo } from "../idiomas.js";

export const ca: TextosNucleo = {
  nivel: {
    seguro: "Anuncis, telemetria, duplicats i apps de farciment. Treure-ho no trenca res.",
    avanzado: "Serveis que funcionen però que molta gent no fa servir. Potser trobaràs a faltar alguna cosa.",
    experto: "Pot afectar funcions del sistema. Només si saps què treus.",
    bloqueado: "Pot deixar el mòbil sense arrencar. Poda no ho toca mai.",
  },
  origen: {
    fabricante: "fabricant",
    operadora: "operadora",
    Google: "Google",
    terceros: "tercers",
    "Android base": "Android base",
  },
  avisoPoda: {
    "com.android.inputmethod.latin": "És el teclat. Si no en tens cap altre d'instal·lat, et quedes sense poder escriure.",
    "com.google.android.inputmethod.latin": "És el teclat (Gboard). Si no en tens cap altre d'instal·lat, et quedes sense poder escriure.",
    "com.android.dialer": "És l'app de trucades.",
    "com.google.android.dialer": "És l'app de trucades.",
    "com.android.messaging": "És l'app d'SMS.",
    "com.google.android.apps.messaging": "És l'app d'SMS.",
    "com.android.contacts": "És l'app de contactes.",
    "com.google.android.contacts": "És l'app de contactes.",
    "com.android.deskclock": "És el rellotge: sense ell no sonen les alarmes.",
    "com.google.android.deskclock": "És el rellotge: sense ell no sonen les alarmes.",
    "com.android.captiveportallogin": "Sense ella no pots entrar a les wifis amb pàgina d'accés (hotels, aeroports, trens).",
    "com.android.hotspot2.osulogin": "Necessària per a algunes wifis públiques.",
    "com.google.android.tts": "És la veu del mòbil: el navegador GPS i l'accessibilitat la fan servir.",
    "com.google.android.syncadapters.contacts": "Sincronitza els teus contactes amb el teu compte de Google.",
    "com.google.android.syncadapters.calendar": "Sincronitza el teu calendari amb el teu compte de Google.",
    "com.google.android.backuptransport": "Fa les còpies de seguretat al teu compte de Google.",
    "com.android.calendar": "És l'app de calendari.",
    "org.lineageos.etar": "És l'app de calendari.",
    "com.android.stk": "Menú de la SIM: algunes operadores el fan servir per a serveis i per activar la línia.",
    "com.android.smspush": "Rep missatges de configuració de l'operadora.",
    "com.android.emergency": "Mostra la teva informació d'emergència a la pantalla de bloqueig.",
    "com.android.storagemanager": "És l'apartat d'emmagatzematge de la configuració.",
    "com.android.providers.downloads.ui": "És la llista de baixades.",
    "com.android.chrome": "Si és el teu únic navegador, et quedes sense navegador.",
    "org.lineageos.jelly": "Si és el teu únic navegador, et quedes sense navegador.",
    "com.android.gallery3d": "Pot ser la teva única galeria de fotos.",
    "org.lineageos.snap": "És la càmera.",
    "com.android.camera2": "És la càmera.",
    "com.google.android.apps.photos": "És Google Fotos: comprova que les teves fotos són al núvol o en una altra app.",
  },
  protegidos: [
    {
      titulo: "Arrencada i configuració del sistema",
      motivo: "Sense ells el mòbil es pot quedar al logotip o sense poder obrir la configuració.",
      familias: [
        "Capes de configuració del fabricant (…auto_generated_rro…)",
        "Temes, icones i colors del sistema (com.android.theme.*)",
        "Temes de LineageOS (org.lineageos.overlay.*)",
        "Ajustos interns de pantalla i navegació (com.android.internal.*)",
        "Proveïdors de dades: contactes, fotos, calendari, configuració… (com.android.providers.*)",
      ],
    },
    {
      titulo: "Pantalla d'inici",
      motivo: "Sense ella el mòbil arrenca a una pantalla buida.",
    },
    {
      titulo: "Posada en marxa",
      motivo: "Alguns sistemes no acaben d'arrencar si falta l'assistent de configuració.",
    },
    {
      titulo: "Trucades, dades i operadora",
      motivo: "Sense ells et pots quedar sense trucades per 4G, sense dades o sense alertes d'emergència.",
      familias: [
        "Configuració d'operadora de cada model (com.android.carrierconfig.*)",
        "Ajustos de wifi de cada model (com.android.wifi.resources.*)",
        "Pila de xarxa (com.android.networkstack.*)",
        "Serveis de telefonia de Qualcomm",
      ],
    },
    {
      titulo: "Serveis de Google",
      motivo: "Moltes apps (bancs, missatgeria, notificacions) deixen de funcionar sense ells.",
    },
  ],
  aviso: {
    rom: "Fas servir {rom}, un sistema alternatiu: gairebé no porta apps de fàbrica, així que Poda trobarà poca cosa per treure.",
    xiaomi:
      "Activa també «Depuració per USB (configuració de seguretat)» a Opcions per a desenvolupadors. Demana iniciar la sessió amb el teu compte Xiaomi i, en algunes versions, tenir una SIM posada. Sense ella, alguns paquets no es deixaran tocar.",
    samsung:
      "Si tens activat el «Bloquejador automàtic» (Configuració → Seguretat i privadesa), desactiva'l mentre fas servir Poda: bloqueja les ordres per USB. Torna a activar-lo quan acabis.",
    huawei: "Funciona amb EMUI, MagicOS i HarmonyOS 4 o anterior. HarmonyOS NEXT (5 o superior) ja no és Android.",
    sinSdk: "No s'ha pogut llegir la versió d'Android: comprova que el mòbil continua connectat i autoritzat.",
    sinQuitar: "La teva versió d'Android és anterior a la 5.0: només es poden desactivar apps, no treure-les.",
    soloCable: "Amb aquesta versió d'Android la connexió ha de ser per cable (la depuració sense fil arriba amb Android 11).",
  },
  capaPixel: "Android de Google (Pixel)",
};
