// Textos del núcleo en portugués (Brasil). Mismas claves y mismo orden que el español (ver ../idiomas.ts).
import type { TextosNucleo } from "../idiomas.js";

export const pt: TextosNucleo = {
  nivel: {
    seguro: "Anúncios, telemetria, duplicados e apps de enfeite. Remover não quebra nada.",
    avanzado: "Serviços que funcionam, mas que muita gente não usa. Você pode sentir falta de algo.",
    experto: "Pode afetar funções do sistema. Só se você souber o que está removendo.",
    bloqueado: "Pode impedir o celular de ligar. O Poda nunca mexe nisso.",
  },
  origen: {
    fabricante: "fabricante",
    operadora: "operadora",
    Google: "Google",
    terceros: "terceiros",
    "Android base": "Android puro",
  },
  avisoPoda: {
    "com.android.inputmethod.latin": "É o teclado. Se você não tiver outro instalado, fica sem poder digitar.",
    "com.google.android.inputmethod.latin": "É o teclado (Gboard). Se você não tiver outro instalado, fica sem poder digitar.",
    "com.android.dialer": "É o app de chamadas.",
    "com.google.android.dialer": "É o app de chamadas.",
    "com.android.messaging": "É o app de SMS.",
    "com.google.android.apps.messaging": "É o app de SMS.",
    "com.android.contacts": "É o app de contatos.",
    "com.google.android.contacts": "É o app de contatos.",
    "com.android.deskclock": "É o relógio: sem ele os alarmes não tocam.",
    "com.google.android.deskclock": "É o relógio: sem ele os alarmes não tocam.",
    "com.android.captiveportallogin": "Sem ele você não consegue entrar nos Wi‑Fi com página de acesso (hotéis, aeroportos, trens).",
    "com.android.hotspot2.osulogin": "Necessário para algumas redes Wi‑Fi públicas.",
    "com.google.android.tts": "É a voz do celular: o GPS e a acessibilidade usam.",
    "com.google.android.syncadapters.contacts": "Sincroniza seus contatos com sua conta do Google.",
    "com.google.android.syncadapters.calendar": "Sincroniza sua agenda com sua conta do Google.",
    "com.google.android.backuptransport": "Faz os backups na sua conta do Google.",
    "com.android.calendar": "É o app de agenda.",
    "org.lineageos.etar": "É o app de agenda.",
    "com.android.stk": "Menu do chip: algumas operadoras usam para serviços e para ativar a linha.",
    "com.android.smspush": "Recebe mensagens de configuração da operadora.",
    "com.android.emergency": "Mostra suas informações de emergência na tela de bloqueio.",
    "com.android.storagemanager": "É a seção de armazenamento das configurações.",
    "com.android.providers.downloads.ui": "É a lista de downloads.",
    "com.android.chrome": "Se for seu único navegador, você fica sem navegador.",
    "org.lineageos.jelly": "Se for seu único navegador, você fica sem navegador.",
    "com.android.gallery3d": "Pode ser sua única galeria de fotos.",
    "org.lineageos.snap": "É a câmera.",
    "com.android.camera2": "É a câmera.",
    "com.google.android.apps.photos": "É o Google Fotos: confira se suas fotos estão na nuvem ou em outro app.",
  },
  protegidos: [
    {
      titulo: "Inicialização e configurações do sistema",
      motivo: "Sem eles o celular pode travar no logo ou ficar sem conseguir abrir as configurações.",
      familias: [
        "Camadas de configuração do fabricante (…auto_generated_rro…)",
        "Temas, ícones e cores do sistema (com.android.theme.*)",
        "Temas do LineageOS (org.lineageos.overlay.*)",
        "Ajustes internos de tela e navegação (com.android.internal.*)",
        "Provedores de dados: contatos, fotos, agenda, configurações… (com.android.providers.*)",
      ],
    },
    {
      titulo: "Tela inicial",
      motivo: "Sem ela o celular liga numa tela vazia.",
    },
    {
      titulo: "Configuração inicial",
      motivo: "Alguns sistemas não terminam de ligar se faltar o assistente de configuração.",
    },
    {
      titulo: "Chamadas, dados e operadora",
      motivo: "Sem eles você pode ficar sem chamadas por 4G, sem dados ou sem alertas de emergência.",
      familias: [
        "Configuração de operadora de cada modelo (com.android.carrierconfig.*)",
        "Ajustes de Wi‑Fi de cada modelo (com.android.wifi.resources.*)",
        "Pilha de rede (com.android.networkstack.*)",
        "Serviços de telefonia da Qualcomm",
      ],
    },
    {
      titulo: "Serviços do Google",
      motivo: "Muitos apps (bancos, mensageiros, notificações) param de funcionar sem eles.",
    },
  ],
  aviso: {
    rom: "Você usa {rom}, um sistema alternativo: quase não traz apps de fábrica, então o Poda vai encontrar pouco para remover.",
    xiaomi:
      "Ative também “Depuração USB (Configurações de segurança)” em Opções do desenvolvedor. É preciso entrar com sua conta Xiaomi e, em algumas versões, ter um chip no celular. Sem isso, alguns pacotes não poderão ser alterados.",
    samsung:
      "Se o “Bloqueador automático” estiver ativado (Configurações → Segurança e privacidade), desative-o enquanto usa o Poda: ele bloqueia os comandos por USB. Ative de novo ao terminar.",
    huawei: "Funciona com EMUI, MagicOS e HarmonyOS 4 ou anterior. O HarmonyOS NEXT (5 ou superior) já não é Android.",
    sinSdk: "Não foi possível ler a versão do Android: confira se o celular continua conectado e autorizado.",
    sinQuitar: "Sua versão do Android é anterior à 5.0: só dá para desativar apps, não removê-los.",
    soloCable: "Com esta versão do Android a conexão tem que ser por cabo (a depuração por Wi-Fi chegou no Android 11).",
  },
  capaPixel: "Android do Google (Pixel)",
};
