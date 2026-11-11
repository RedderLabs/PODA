// Validación de nombres de paquete. `adb shell` junta los argumentos en una sola línea que
// ejecuta el móvil: un nombre sin validar sería una inyección de comandos.
const RE_PAQUETE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/;

export function esPaqueteValido(p: string): boolean {
  return p.length <= 255 && RE_PAQUETE.test(p);
}

export function paquetesDe(salida: string): Set<string> {
  return new Set(
    salida
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith("package:"))
      .map((l) => l.slice(8)),
  );
}
