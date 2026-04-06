---
name: career-ops
description: Drupal opportunity command center -- evaluate jobs, contracts, freelance leads, proposals, scan sources, and track the pipeline.
user_invocable: true
args: mode
---

# career-ops -- Router

## Mode Routing

Determine the mode from `{{mode}}`:

| Input | Mode |
|-------|------|
| (empty / no args) | `discovery` |
| role text, brief, lead note, or URL | `auto-pipeline` |
| `oferta` | `oferta` |
| `ofertas` | `ofertas` |
| `contacto` | `contacto` |
| `deep` | `deep` |
| `pdf` | `pdf` |
| `training` | `training` |
| `project` | `project` |
| `tracker` | `tracker` |
| `pipeline` | `pipeline` |
| `apply` | `apply` |
| `scan` | `scan` |
| `batch` | `batch` |

If `{{mode}}` is not a known sub-command and looks like a JD, contract brief, RFP, lead note, or opportunity URL, run `auto-pipeline`.

## Discovery Mode

Show this menu:

```text
career-ops -- Drupal Opportunity Pipeline

Available commands:
  /career-ops {input}     -> Auto-pipeline for a role, contract, or lead
  /career-ops pipeline    -> Process pending URLs from data/pipeline.md
  /career-ops oferta      -> Evaluate one opportunity
  /career-ops contacto    -> Outreach or follow-up message
  /career-ops deep        -> Deep company or client research
  /career-ops pdf         -> Tailored CV or capability PDF
  /career-ops tracker     -> Opportunity tracker overview
  /career-ops apply       -> Live form or proposal assistant
  /career-ops scan        -> Scan sources for new opportunities
  /career-ops batch       -> Batch process opportunities
```

## Context Loading

For `auto-pipeline`, `oferta`, `ofertas`, `pdf`, `contacto`, `apply`, `pipeline`, `scan`, and `batch`:

- read `CLAUDE.md`
- read `modes/_shared.md`
- read `modes/{mode}.md`

For `tracker`, `deep`, `training`, and `project`:

- read `CLAUDE.md`
- read `modes/{mode}.md`

Before executing the mode, confirm that `cv.md`, `config/profile.yml`, and `portals.yml` exist. If not, follow onboarding from `CLAUDE.md`.
