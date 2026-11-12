// Datos del escáner de la portada (componente Escaner). Los textos de la web están en textos/.

export const MOVILES_ESCANER = [
  {
    "marca": "Xiaomi",
    "capa": "HyperOS",
    "paquetes": [
      "com.miui.analytics",
      "com.miui.msa.global",
      "com.xiaomi.mipicks",
      "com.miui.videoplayer",
      "com.facebook.appmanager",
      "com.facebook.services",
      "com.miui.yellowpage"
    ]
  },
  {
    "marca": "Samsung",
    "capa": "One UI",
    "paquetes": [
      "com.samsung.android.bixby.agent",
      "com.samsung.android.app.tips",
      "com.samsung.android.ardrawing",
      "com.samsung.android.aremoji",
      "com.facebook.system",
      "com.microsoft.skydrive"
    ]
  },
  {
    "marca": "OPPO",
    "capa": "ColorOS",
    "paquetes": [
      "com.heytap.market",
      "com.heytap.browser",
      "com.heytap.pictorial",
      "com.coloros.gamespace",
      "com.facebook.katana",
      "com.facebook.appmanager"
    ]
  },
  {
    "marca": "Motorola",
    "capa": "Hello UI",
    "paquetes": [
      "com.motorola.help",
      "com.motorola.demo",
      "com.facebook.services",
      "com.facebook.system",
      "com.linkedin.android",
      "com.netflix.partner.activation"
    ]
  }
] as const;
