# Mode: pipeline — URL Inbox

Process opportunities accumulated in `data/pipeline.md`.

## Flow

1. Read pending items.
2. For each item:
   - extract the content
   - run `auto-pipeline`
   - move it to processed
3. If a URL fails, mark it with a note and continue.

## Format

```markdown
## Pending
- [ ] https://example.com/job
- [ ] https://example.com/brief | Client | Drupal migration

## Processed
- [x] #001 | https://example.com/job | Company | Senior Drupal Developer | 4.3/5 | PDF ✅
```
