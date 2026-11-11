# Seguridad

Poda envía comandos a un móvil. Un fallo de seguridad aquí puede afectar al dispositivo de alguien, así que nos lo tomamos en serio.

## Cómo avisar

**No abras una issue pública.** Usa el aviso privado de GitHub: [Report a vulnerability](https://github.com/RedderLabs/PODA/security/advisories/new).

Incluye qué versión o commit usaste, los pasos para reproducirlo y qué impacto tiene. Te responderemos en cuanto podamos y te mantendremos al tanto hasta que esté corregido.

## Qué nos interesa especialmente

- Cualquier forma de que un nombre de paquete u otro dato llegue sin validar a la línea de comandos del móvil.
- Formas de saltarse la copia previa, la confirmación o el bloqueo de paquetes `bloqueado`.
- Archivos de copia manipulados que hagan que «restaurar» quite apps.
- Que la web envíe a algún sitio datos del móvil del usuario.

## Versiones

Solo se da soporte a la última versión de la rama `main` y a la web publicada en podamovil.com.
