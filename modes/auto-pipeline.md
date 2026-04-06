# Mode: auto-pipeline — Full Pipeline

When the user pastes a URL or description, assume it may be:

- a full-time role
- a contract role
- a freelance lead
- a brief or RFP

## Step 0 — Extract The Content

1. URL -> use Playwright, then WebFetch, then WebSearch.
2. Pasted text -> use it directly.
3. If the context is incomplete -> ask for the full text.

## Step 1 — Classify

Determine:

- opportunity type
- archetype
- seniority
- whether the correct output is a CV, capability statement, or qualification notes

## Step 2 — Evaluation

Run the evaluate flow.

## Step 3 — Report

Save the full report in:

`reports/{company-slug}/{YYYY-MM-DD}-{role-slug}/{###}-{company-slug}-{YYYY-MM-DD}.md`

## Step 3.5 — Output Folder

Create an opportunity asset folder at:

`output/{company-slug}/{YYYY-MM-DD}-{role-slug}/`

Keep all generated files for that opportunity in that folder.

## Step 4 — PDF

If the score is >= 3.5 and there is a realistic path forward:

- full-time -> tailored CV
- contract -> tailored CV or one-pager
- freelance -> capability statement or proposal draft

## Step 5 — Drafts

If the score is >= 4.2, generate:

- form answers for full-time roles
- a follow-up email or message for contract roles
- qualification questions or a short pitch for freelance leads

## Step 6 — Tracker

Register the opportunity in `data/applications.md` with the initial status `Qualified`.
