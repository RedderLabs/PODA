// Tipos para importar hojas de estilo sin módulo (import "./globals.css").
// TypeScript 6 comprueba por defecto las importaciones «de efecto» (noUncheckedSideEffectImports)
// y Next.js solo declara los *.module.css, así que sin esto el editor marca error en layout.tsx.
declare module "*.css";
