// Textos del núcleo en inglés. Mismas claves y mismo orden que el español (ver ../idiomas.ts).
import type { TextosNucleo } from "../idiomas.js";

export const en: TextosNucleo = {
  nivel: {
    seguro: "Ads, telemetry, duplicates and filler apps. Removing them doesn't break anything.",
    avanzado: "Services that work but many people never use. You might miss something.",
    experto: "Can affect system features. Only if you know what you're removing.",
    bloqueado: "Can stop the phone from starting up. Poda never touches it.",
  },
  origen: {
    fabricante: "manufacturer",
    operadora: "carrier",
    Google: "Google",
    terceros: "third parties",
    "Android base": "base Android",
  },
  avisoPoda: {
    "com.android.inputmethod.latin": "It's the keyboard. If you don't have another one installed, you won't be able to type.",
    "com.google.android.inputmethod.latin": "It's the keyboard (Gboard). If you don't have another one installed, you won't be able to type.",
    "com.android.dialer": "It's the phone app for calls.",
    "com.google.android.dialer": "It's the phone app for calls.",
    "com.android.messaging": "It's the SMS app.",
    "com.google.android.apps.messaging": "It's the SMS app.",
    "com.android.contacts": "It's the contacts app.",
    "com.google.android.contacts": "It's the contacts app.",
    "com.android.deskclock": "It's the clock: without it, alarms won't go off.",
    "com.google.android.deskclock": "It's the clock: without it, alarms won't go off.",
    "com.android.captiveportallogin": "Without it you can't sign in to Wi‑Fi networks with a login page (hotels, airports, trains).",
    "com.android.hotspot2.osulogin": "Needed for some public Wi‑Fi networks.",
    "com.google.android.tts": "It's the phone's voice: GPS navigation and accessibility use it.",
    "com.google.android.syncadapters.contacts": "Syncs your contacts with your Google account.",
    "com.google.android.syncadapters.calendar": "Syncs your calendar with your Google account.",
    "com.google.android.backuptransport": "Backs up your phone to your Google account.",
    "com.android.calendar": "It's the calendar app.",
    "org.lineageos.etar": "It's the calendar app.",
    "com.android.stk": "SIM menu: some carriers use it for services and to activate your line.",
    "com.android.smspush": "Receives configuration messages from your carrier.",
    "com.android.emergency": "Shows your emergency information on the lock screen.",
    "com.android.storagemanager": "It's the storage section in Settings.",
    "com.android.providers.downloads.ui": "It's the downloads list.",
    "com.android.chrome": "If it's your only browser, you'll be left without one.",
    "org.lineageos.jelly": "If it's your only browser, you'll be left without one.",
    "com.android.gallery3d": "It may be your only photo gallery.",
    "org.lineageos.snap": "It's the camera.",
    "com.android.camera2": "It's the camera.",
    "com.google.android.apps.photos": "It's Google Photos: check that your photos are in the cloud or in another app.",
  },
  protegidos: [
    {
      titulo: "Startup and system settings",
      motivo: "Without them the phone can get stuck on the logo or be unable to open Settings.",
      familias: [
        "Manufacturer configuration overlays (…auto_generated_rro…)",
        "System themes, icons and colors (com.android.theme.*)",
        "LineageOS themes (org.lineageos.overlay.*)",
        "Internal display and navigation settings (com.android.internal.*)",
        "Data providers: contacts, photos, calendar, settings… (com.android.providers.*)",
      ],
    },
    {
      titulo: "Home screen",
      motivo: "Without it the phone starts up to a blank screen.",
    },
    {
      titulo: "Initial setup",
      motivo: "Some systems don't finish starting up if the setup wizard is missing.",
    },
    {
      titulo: "Calls, data and carrier",
      motivo: "Without them you can lose 4G calling, mobile data or emergency alerts.",
      familias: [
        "Per-model carrier configuration (com.android.carrierconfig.*)",
        "Per-model Wi‑Fi settings (com.android.wifi.resources.*)",
        "Network stack (com.android.networkstack.*)",
        "Qualcomm telephony services",
      ],
    },
    {
      titulo: "Google services",
      motivo: "Many apps (banking, messaging, notifications) stop working without them.",
    },
  ],
  aviso: {
    rom: "You're running {rom}, a custom system: it comes with hardly any factory apps, so Poda will find little to remove.",
    xiaomi:
      "Also turn on “USB debugging (Security settings)” in Developer options. It asks you to sign in with your Xiaomi account and, on some versions, to have a SIM card inserted. Without it, some packages can't be touched.",
    samsung:
      "If you have “Auto Blocker” turned on (Settings → Security and privacy), turn it off while you use Poda: it blocks commands over USB. Turn it back on when you're done.",
    huawei: "Works with EMUI, MagicOS and HarmonyOS 4 or earlier. HarmonyOS NEXT (5 or later) is no longer Android.",
    sinSdk: "Couldn't read the Android version: check that the phone is still connected and authorized.",
    sinQuitar: "Your Android version is older than 5.0: apps can only be disabled, not removed.",
    soloCable: "With this Android version the connection has to be by cable (wireless debugging arrived in Android 11).",
  },
  capaPixel: "Google's Android (Pixel)",
};
