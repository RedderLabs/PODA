# Producto

Estado: describe Poda tal como está hoy (noviembre de 2026).

## Propósito

Que cualquier persona, sin conocimientos técnicos, quite de su Android las apps que puso de serie el fabricante o la operadora, sin root, sin romper el móvil y pudiendo volver atrás.

## Usuarios y casos de uso

Por orden de importancia:

1. **Persona sin conocimientos técnicos con un ordenador** (Chrome o Edge). Conecta el móvil por cable en podamovil.com/conectar, elige un perfil, confirma y quita las apps. Es el flujo principal.
2. **La misma persona cuando algo ha dejado de funcionar.** Restaura desde la copia, app a app o entera, en la misma pantalla o con la guía de rescate.
3. **Persona que usa un asistente de IA** (Claude Code u otro). El asistente sigue `PROMPT.md` y usa el servidor MCP o la línea de comandos `poda`.
4. **Persona sin ordenador con Android 11 o superior.** Sigue la guía /sin-pc (Shizuku + Canta) con la lista de lo que Poda no toca.
5. **Curiosos y prensa.** Consultan /marcas: qué trae cada fabricante y con qué riesgo.

## Alcance actual

- Tres vías que comparten reglas: web (WebUSB), servidor MCP y línea de comandos.
- Reconocimiento del móvil: marca, modelo, Android, capa y ROM personalizada, con avisos por marca.
- Niveles (`seguro`, `avanzado`, `experto`, `bloqueado`) y perfiles (`seguro`, `recomendado`, `experto`).
- Acciones: quitar para el usuario 0 o desactivar. Volver a poner o reactivar.
- Copia del estado antes de cambiar nada y confirmación explícita (en la web, con el PIN del móvil).
- Web estática en cinco idiomas: español, inglés, portugués de Brasil, francés y catalán.

## Fuera de alcance

- Root, borrar apps del sistema o tocar otros usuarios del móvil.
- iPhone y iPad. HarmonyOS NEXT solo tiene una guía (especificación 003): Poda no se conecta a él.
- Cuentas, servidores propios o envío de la lista de apps del usuario a ningún sitio.
- Instalar apps o cambiar ajustes del sistema que no sean el estado de los paquetes.

## Requisitos no funcionales

| Requisito | Valor |
|---|---|
| Privacidad | Ningún dato del móvil sale del ordenador. Solo se cuentan visitas a páginas (Umami). |
| Seguridad del móvil | Un paquete `bloqueado` o protegido no se quita ni se desactiva por ninguna vía. |
| Reversibilidad | Todo cambio se deshace con la copia. Restaurar nunca quita nada. |
| Compatibilidad | Android 5.0 o superior con depuración USB. Escritorio con WebUSB (Chrome, Edge, Brave, Opera). |
| Idiomas | Los cinco idiomas con las mismas claves; las pruebas fallan si falta una traducción. |
| Despliegue | Web estática servida por HTTPS (WebUSB lo exige), sin rutas de servidor. |
| Accesibilidad | [POR ACLARAR: objetivo — se propone WCAG 2.1 AA en /conectar] |
| Rendimiento | [POR ACLARAR: objetivo — se propone Core Web Vitals en verde en móvil para la portada] |
