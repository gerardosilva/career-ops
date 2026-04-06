---
name: career-ops
description: Evaluate Drupal opportunities from one pipeline. Use when the user wants to assess a full-time role, contract, freelance lead, RFP, proposal, outreach step, or a batch of Drupal-related opportunities, then track the result and choose the next action.
---

# Career-Ops

## Overview

Use this skill to run the Drupal opportunity pipeline in this repository. It is designed for a Drupal professional who works across:

- full-time roles
- contracts
- freelance projects
- retainers
- inbound leads

## Resolve The Repo Root

Before doing anything, resolve the repo root as the directory that contains:

- `modes/`
- `templates/`
- `config/`
- `package.json`

All file references below are relative to that root.

## Onboarding Check

Before evaluating or scanning, verify:

- `cv.md`
- `config/profile.yml`
- `portals.yml`

If any are missing, follow `CLAUDE.md` onboarding guidance and create them first.

## Routing

Choose a mode from the user request:

- pasted role, brief, lead note, or URL -> `auto-pipeline`
- `scan` -> `modes/scan.md`
- `tracker` -> `modes/tracker.md`
- `pdf` -> `modes/pdf.md`
- `apply` -> `modes/apply.md`
- `contacto` or outreach request -> `modes/contacto.md`
- queued URLs or inbox processing -> `modes/pipeline.md`
- direct evaluation request -> `modes/oferta.md`
- batch processing -> `modes/batch.md`

If the request is not explicit but includes a JD, contract brief, RFP, or opportunity URL, default to `auto-pipeline`.

## Context To Load

For most work, read:

1. `CLAUDE.md`
2. `modes/_shared.md`
3. the selected mode file

When needed, also read:

- `config/profile.yml`
- `cv.md`
- `article-digest.md`
- `templates/portals.example.yml`
- `templates/states.yml`

## Operating Rules

- Evaluate both technical fit and commercial fit.
- Treat full-time and freelance opportunities as different sales motions.
- Use `Qualified`, `Reached Out`, `Submitted`, `In Process`, `Negotiating`, `Won`, `Lost`, `Parked` as canonical tracker states.
- Do not invent metrics or Drupal experience.
- Do not submit anything without review.

## Helpful Scripts

- `node cv-sync-check.mjs`
- `node verify-pipeline.mjs`
- `node merge-tracker.mjs`
- `node normalize-statuses.mjs`
- `node dedup-tracker.mjs`

## Expected Outputs

Depending on the mode, produce one or more of:

- evaluation report
- tailored CV
- capability statement
- proposal outline
- outreach message
- tracker update
