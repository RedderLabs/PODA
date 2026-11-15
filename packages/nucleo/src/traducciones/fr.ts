// Textos del núcleo en francés. Mismas claves y mismo orden que el español (ver ../idiomas.ts).
import type { TextosNucleo } from "../idiomas.js";

export const fr: TextosNucleo = {
  nivel: {
    seguro: "Publicités, télémétrie, doublons et applis superflues. Les retirer ne casse rien.",
    avanzado: "Des services qui fonctionnent, mais que beaucoup de gens n'utilisent pas. Il se peut qu'il vous en manque un.",
    experto: "Peut affecter des fonctions du système. Seulement si vous savez ce que vous retirez.",
    bloqueado: "Peut empêcher le téléphone de démarrer. Poda n'y touche jamais.",
  },
  origen: {
    fabricante: "fabricant",
    operadora: "opérateur",
    Google: "Google",
    terceros: "tiers",
    "Android base": "Android de base",
  },
  avisoPoda: {
    "com.android.inputmethod.latin": "C'est le clavier. Si vous n'en avez pas d'autre, vous ne pourrez plus écrire.",
    "com.google.android.inputmethod.latin": "C'est le clavier (Gboard). Si vous n'en avez pas d'autre, vous ne pourrez plus écrire.",
    "com.android.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.google.android.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.sec.android.app.clockpackage": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.huawei.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.hihonor.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.coloros.alarmclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.oneplus.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.android.BBKClock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.lge.clock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.asus.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.transsion.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.zui.deskclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "cn.nubia.deskclock.preset": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "zte.com.cn.alarmclock": "C'est l'horloge : sans elle, les alarmes ne sonnent pas.",
    "com.android.captiveportallogin":
      "Sans elle, vous ne pouvez pas vous connecter aux Wi‑Fi avec page de connexion (hôtels, aéroports, trains).",
    "com.android.hotspot2.osulogin": "Nécessaire pour certains Wi‑Fi publics.",
    "com.google.android.tts": "C'est la voix du téléphone : le GPS et l'accessibilité s'en servent.",
    "com.google.android.syncadapters.calendar": "Synchronise votre agenda avec votre compte Google.",
    "com.google.android.backuptransport": "Fait les sauvegardes sur votre compte Google.",
    "com.android.calendar": "C'est l'appli Agenda.",
    "org.lineageos.etar": "C'est l'appli Agenda.",
    "com.android.storagemanager": "C'est la rubrique Stockage des paramètres.",
    "com.android.providers.downloads.ui": "C'est la liste des téléchargements.",
    "com.android.chrome": "Si c'est votre seul navigateur, vous n'aurez plus de navigateur.",
    "org.lineageos.jelly": "Si c'est votre seul navigateur, vous n'aurez plus de navigateur.",
    "com.android.gallery3d": "C'est peut-être votre seule galerie de photos.",
    "org.lineageos.snap": "C'est l'appareil photo.",
    "com.android.camera2": "C'est l'appareil photo.",
    "com.google.android.apps.photos":
      "C'est Google Photos : vérifiez que vos photos sont dans le cloud ou dans une autre appli.",
  },
  protegidos: [
    {
      titulo: "Démarrage et paramètres du système",
      motivo: "Sans eux, le téléphone peut rester bloqué sur le logo ou ne plus ouvrir les paramètres.",
      familias: [
        "Couches de configuration du fabricant (…auto_generated_rro…)",
        "Thèmes, icônes et couleurs du système (com.android.theme.*)",
        "Thèmes de LineageOS (org.lineageos.overlay.*)",
        "Réglages internes d'affichage et de navigation (com.android.internal.*)",
        "Fournisseurs de données : contacts, photos, agenda, paramètres… (com.android.providers.*)",
      ],
    },
    {
      titulo: "Écran d'accueil",
      motivo: "Sans lui, le téléphone démarre sur un écran vide.",
    },
    {
      titulo: "Première configuration",
      motivo: "Certains systèmes ne finissent pas de démarrer s'il manque l'assistant de configuration.",
    },
    {
      titulo: "Appels, données et opérateur",
      motivo: "Sans eux, vous pouvez perdre les appels en 4G, les données mobiles ou les alertes d'urgence.",
      familias: [
        "Configuration opérateur de chaque modèle (com.android.carrierconfig.*)",
        "Réglages Wi‑Fi de chaque modèle (com.android.wifi.resources.*)",
        "Pile réseau (com.android.networkstack.*)",
        "Services de téléphonie de Qualcomm",
      ],
    },
    {
      titulo: "Téléphone, messages et contacts",
      motivo: "Sans elles, impossible d'appeler, d'envoyer des SMS ou MMS ou de voir vos contacts, quelle que soit la marque.",
    },
    {
      titulo: "Localisation et GPS",
      motivo: "Sans elles, le GPS, les cartes et la localisation en cas d'urgence ne fonctionnent plus.",
    },
    {
      titulo: "Services Google",
      motivo: "Beaucoup d'applis (banques, messageries, notifications) ne fonctionnent plus sans eux.",
    },
  ],
  aviso: {
    rom: "Vous utilisez {rom}, un système alternatif : il n'a presque pas d'applis d'usine, Poda trouvera donc peu de choses à retirer.",
    xiaomi:
      "Activez aussi « Débogage USB (paramètres de sécurité) » dans les Options pour les développeurs. Il faut se connecter avec votre compte Xiaomi et, sur certaines versions, avoir une carte SIM insérée. Sans cela, certains paquets ne pourront pas être modifiés.",
    samsung:
      "Si le « Bloqueur automatique » est activé (Paramètres → Sécurité et confidentialité), désactivez-le pendant que vous utilisez Poda : il bloque les commandes par USB. Réactivez-le une fois terminé.",
    huawei: "Fonctionne avec EMUI, MagicOS et HarmonyOS 4 ou antérieur. HarmonyOS NEXT (5 ou supérieur) n'est plus Android.",
    sinSdk: "Impossible de lire la version d'Android : vérifiez que le téléphone est toujours connecté et autorisé.",
    sinQuitar: "Votre version d'Android est antérieure à la 5.0 : on peut seulement désactiver les applis, pas les retirer.",
    soloCable: "Avec cette version d'Android, la connexion doit se faire par câble (le débogage sans fil arrive avec Android 11).",
  },
  capaPixel: "Android de Google (Pixel)",
  fondo: {
    pasos: {
      xiaomi: [
        "Ouvrez « Galerie » et allez dans l'album « Poda ».",
        "Ouvrez l'image et touchez « Plus » (les trois points).",
        "Touchez « Définir comme fond d'écran » et choisissez l'écran de verrouillage, l'écran d'accueil ou les deux.",
      ],
      samsung: [
        "Ouvrez « Galerie » et allez dans l'album « Poda ».",
        "Ouvrez l'image et touchez les trois points en bas à droite.",
        "Touchez « Définir comme fond d'écran » et choisissez l'écran de verrouillage, l'écran d'accueil ou les deux.",
      ],
      oppo: [
        "Ouvrez « Photos » et allez dans l'album « Poda ».",
        "Ouvrez l'image et touchez « Plus ».",
        "Touchez « Définir comme fond d'écran » et choisissez l'écran de verrouillage, l'écran d'accueil ou les deux.",
      ],
      general: [
        "Ouvrez la galerie de photos (Galerie, Photos ou Google Photos) et cherchez le dossier « Poda ».",
        "Ouvrez l'image et touchez le menu (les trois points).",
        "Cherchez « Utiliser comme » ou « Définir comme fond d'écran » et choisissez l'écran.",
      ],
    },
    noAparece: "Si vous ne la voyez pas, attendez quelques minutes ou cherchez-la dans l'app « Fichiers », dans Images › Poda.",
    borrar: "Si vous n'en voulez pas, supprimez-la depuis la galerie comme n'importe quelle photo. Restaurer les apps ne la supprime pas.",
  },
};
