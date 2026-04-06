# Modo: scan — Descubrimiento de Oportunidades

Escanea fuentes configuradas y añade nuevas oportunidades al pipeline.

## Fuentes

- job boards para full-time
- job boards para contract
- marketplaces freelance
- vendors y consultoras Drupal
- empresas con roles Drupal o CMS serios

## Workflow

1. Leer `portals.yml`
2. Leer `data/scan-history.tsv`
3. Leer `data/applications.md` y `data/pipeline.md`
4. Ejecutar tracked companies
5. Ejecutar search queries
6. Filtrar por `title_filter`
7. Deduplicar
8. Añadir nuevas oportunidades a `pipeline.md`

## Filtro

Una oportunidad es relevante si:

- contiene Drupal o terminos muy cercanos
- no es claramente de otra especialidad
- encaja con full-time, contract o freelance

## Resumen de salida

```text
Portal Scan — {YYYY-MM-DD}
Opportunities found: N
Relevant: N
Duplicates: N
Added to pipeline: N
```
