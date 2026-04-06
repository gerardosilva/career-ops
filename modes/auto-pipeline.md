# Modo: auto-pipeline — Pipeline Completo

Cuando el usuario pega una URL o descripción, asumir que puede ser:

- una vacante full-time
- un contrato
- un lead freelance
- un brief o RFP

## Paso 0 — Extraer el contenido

1. URL -> usar Playwright, luego WebFetch, luego WebSearch.
2. Texto pegado -> usar directo.
3. Si no hay suficiente contexto -> pedir el texto completo.

## Paso 1 — Clasificar

Determinar:

- tipo de oportunidad
- arquetipo
- seniority
- si el output correcto es CV, capability statement, o solo qualification notes

## Paso 2 — Evaluación

Ejecutar `oferta`.

## Paso 3 — Reporte

Guardar el reporte completo en `reports/{###}-{company-slug}-{YYYY-MM-DD}.md`.

## Paso 4 — PDF

Si el score es >= 3.5 y existe una vía razonable de avance:

- full-time -> CV adaptado
- contract -> CV o one-pager
- freelance -> capability statement o borrador de propuesta

## Paso 5 — Borradores

Si el score es >= 4.2, generar:

- respuestas de formulario para full-time
- email o message de follow-up para contrato
- qualification questions o pitch breve para freelance

## Paso 6 — Tracker

Registrar en `data/applications.md` con estado inicial `Qualified`.
