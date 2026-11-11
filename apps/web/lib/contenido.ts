// Textos y datos de la landing. Editar aquí cambia la web.

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

export const PASOS = [
  {
    "n": "01",
    "titulo": "Activa la depuración USB",
    "texto": "Una guía con capturas para tu marca concreta. Dos minutos, y se desactiva al terminar."
  },
  {
    "n": "02",
    "titulo": "Conecta el cable",
    "texto": "Abre Poda en Chrome o Edge y acepta la conexión en el móvil. No hay programa que descargar."
  },
  {
    "n": "03",
    "titulo": "Elige perfil",
    "texto": "Seguro, recomendado o experto, ya ajustado a tu modelo. Cada paquete viene explicado en lenguaje normal."
  },
  {
    "n": "04",
    "titulo": "Aplica con copia",
    "texto": "Antes de tocar nada se guarda un punto de vuelta atrás. Si algo no te convence, lo deshaces con un clic."
  }
];

export const PERFILES_LANDING = [
  {
    "nombre": "Seguro",
    "etiqueta": "para todos",
    "texto": "Publicidad, analítica y apps duplicadas del fabricante. Nada que afecte al funcionamiento del sistema.",
    "ejemplo": "anuncios · telemetría · tiendas duplicadas"
  },
  {
    "nombre": "Recomendado",
    "etiqueta": "por defecto",
    "texto": "Lo anterior más los servicios del fabricante y de la operadora que la mayoría no usa nunca.",
    "ejemplo": "+ asistentes · apps de operadora · demos"
  },
  {
    "nombre": "Experto",
    "etiqueta": "con avisos",
    "texto": "Todo lo que se puede desactivar sin root, con una advertencia en cada paquete delicado.",
    "ejemplo": "+ servicios de sistema no críticos"
  }
];

export const LO_QUE_SI = [
  "Menos procesos en segundo plano, más batería y algo más de fluidez.",
  "Menos rastreo: fuera la telemetría y los anuncios del fabricante.",
  "Vuelta atrás en un clic, paquete a paquete o todo a la vez.",
  "Volver a pasar Poda después de una actualización del sistema."
];

export const LO_QUE_NO = [
  "No libera almacenamiento: el APK sigue en la partición del sistema.",
  "No necesita root ni desbloquear el bootloader.",
  "No funciona en iPhone: iOS no lo permite.",
  "No convierte un móvil viejo en uno nuevo. Ayuda, pero no hace milagros."
];

export const PREGUNTAS = [
  {
    "pregunta": "¿Puedo romper el móvil?",
    "respuesta": "Poda nunca toca lo que el móvil necesita para arrancar, llamar o conectarse, y por defecto solo marca las apps seguras que no tienen icono. Aun así ninguna lista es perfecta: antes de cambiar nada se guarda una copia, y si algo falla se deshace desde la web o con la guía de rescate."
  },
  {
    "pregunta": "¿Pierdo la garantía?",
    "respuesta": "No hace falta root ni tocar el bootloader. Solo se desactivan apps para tu usuario, lo mismo que puedes hacer a mano en Ajustes con algunas."
  },
  {
    "pregunta": "¿Qué pasa cuando el móvil se actualiza?",
    "respuesta": "Algunas actualizaciones reinstalan apps. Vuelve a conectar el móvil: Poda te enseñará las que han vuelto y podrás quitarlas otra vez."
  },
  {
    "pregunta": "¿Se envían mis datos a algún sitio?",
    "respuesta": "La conexión va del navegador al móvil por el cable. La lista de paquetes de tu móvil no sale de tu ordenador."
  },
  {
    "pregunta": "¿Se puede hacer sin ordenador?",
    "respuesta": "En Android 11 o superior, sí: el móvil puede conectarse a sí mismo por depuración inalámbrica con apps como Shizuku y Canta. En la página «Sin ordenador» tienes los pasos y la lista de Poda de lo que no debes quitar.",
    "enlace": { "href": "/sin-pc/", "texto": "Ver cómo hacerlo sin ordenador" }
  },
  {
    "pregunta": "¿Qué navegador necesito?",
    "respuesta": "Uno basado en Chromium de escritorio: Chrome, Edge, Brave u Opera. Firefox y Safari no admiten WebUSB."
  }
];

export const PROMPT_CLAUDE = "Clona https://github.com/RedderLabs/PODA y sigue las instrucciones de PROMPT.md.\nMi móvil Android está en la misma Wi‑Fi y tiene activada la depuración inalámbrica.\nDetecta la marca y el modelo, y enséñame el perfil recomendado con cada paquete explicado en lenguaje normal.\nAntes de tocar nada, guarda una copia para poder volver atrás.\nNo apliques ningún cambio hasta que yo lo confirme.";
