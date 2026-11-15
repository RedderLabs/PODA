# Tareas: descripciones de las apps en el idioma de la web

Cambio pequeño: no lleva `plan.md`.

- [x] T1 (R-001 a R-003) `apps/web/lib/traducir.ts`: disponibilidad, creación del traductor, traducción en orden y caché en el navegador. Pruebas en `apps/web/test/traducir.test.mjs`.
- [x] T2 (R-001, R-004) `components/usarTraduccion.ts` y la lista de `Podar.tsx`: descripción traducida, `lang` correcto, búsqueda por las dos y aviso con el botón.
- [x] T3 (R-005) Textos en los cinco idiomas y nota de la lista corregida.
- [x] T5 (R-006) Traducciones publicadas con la web: `scripts/descripciones.mjs`, `scripts/comprobar-descripciones.mjs`, `data/descripciones/<idioma>.json` y `public/descripciones-<idioma>.json`.
- [ ] T4 Probar en Chrome 138+ con la web en español, portugués, francés y catalán (el catalán puede no estar disponible en el traductor de Chrome: entonces debe salir el aviso de R-002).
