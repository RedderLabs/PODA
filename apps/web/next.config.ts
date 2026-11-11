import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

// Web 100 % estática: no hay servidor. Todo lo del móvil pasa en el navegador del usuario.
// @poda/nucleo se usa desde su código fuente (no desde dist/): así `next dev` siempre ve la última
// versión y no hace falta recompilar el núcleo a mano.
const nucleo = fileURLToPath(new URL("../../packages/nucleo/src/index.ts", import.meta.url));

const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  transpilePackages: ["@poda/nucleo"],
  webpack(c) {
    c.resolve.alias = { ...c.resolve.alias, "@poda/nucleo$": nucleo };
    c.resolve.extensionAlias = { ...c.resolve.extensionAlias, ".js": [".ts", ".js"] };
    return c;
  },
};

export default config;
