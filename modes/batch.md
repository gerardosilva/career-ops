# Mode: batch — Bulk Opportunity Processing

Two operating modes are supported: **conductor --chrome** for live browsing, or **standalone** for a prepared list of URLs.

## Architecture

```text
Claude Conductor (claude --chrome --dangerously-skip-permissions)
  |
  |  Chrome: browses live portals and logged-in sessions
  |  Reads the DOM directly while the user can see everything
  |
  |- Opportunity 1: read brief or JD from DOM + URL
  |    -> claude -p worker -> report + PDF + tracker line
  |
  |- Opportunity 2: click next, read brief or JD + URL
  |    -> claude -p worker -> report + PDF + tracker line
  |
  -> End: merge tracker additions into applications.md + summary
```

Each worker is a clean `claude -p` child process. The conductor only orchestrates.

## Files

```text
batch/
  batch-input.tsv
  batch-state.tsv
  batch-runner.sh
  batch-prompt.md
  logs/
  tracker-additions/
```

## Mode A: Conductor --chrome

1. Read `batch/batch-state.tsv` to see completed items.
2. Navigate a search portal in Chrome.
3. Extract result URLs and append them to `batch-input.tsv`.
4. For each pending URL:
   - open the opportunity
   - read the visible JD or brief
   - save it to `/tmp/batch-jd-{id}.txt`
   - calculate the next report number
   - run the batch worker
   - update `batch-state.tsv`
   - save a log
   - move to the next result
5. Merge tracker additions at the end.

## Mode B: Standalone

```bash
batch/batch-runner.sh [OPTIONS]
```

Common flags:

- `--dry-run`
- `--retry-failed`
- `--start-from N`
- `--parallel N`
- `--max-retries N`

## Resumability

- Re-running should skip completed items.
- A lock file prevents double execution.
- A failed item should not block the rest of the batch.

## Worker Outputs

Each worker produces:

1. a report in `reports/{company-slug}/{YYYY-MM-DD}-{role-slug}/`
2. an opportunity asset folder in `output/{company-slug}/{YYYY-MM-DD}-{role-slug}/`
3. a tracker addition in `batch/tracker-additions/`
4. a JSON result on stdout
