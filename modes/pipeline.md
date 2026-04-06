# Modo: pipeline — Inbox de URLs

Procesa oportunidades acumuladas en `data/pipeline.md`.

## Flujo

1. Leer pendientes
2. Para cada item:
   - extraer contenido
   - ejecutar `auto-pipeline`
   - moverlo a procesadas
3. Si falla una URL, marcarla con nota y seguir

## Formato

```markdown
## Pendientes
- [ ] https://example.com/job
- [ ] https://example.com/brief | Client | Drupal migration

## Procesadas
- [x] #001 | https://example.com/job | Company | Senior Drupal Developer | 4.3/5 | PDF ✅
```
