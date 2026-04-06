# Career-Ops -- Drupal Opportunity Pipeline

## Purpose

This fork is a working system for a Drupal professional who wants to evaluate and pursue:

- full-time jobs
- contract roles
- freelance projects
- retainers
- inbound leads and referrals

Treat every opportunity as a commercial decision, not just a job application.

## Sources Of Truth

Read these before evaluating anything:

| File | Purpose |
|------|---------|
| `cv.md` | Canonical CV and experience base |
| `article-digest.md` | Detailed proof points, case studies, metrics, wins |
| `config/profile.yml` | Identity, targets, rate expectations, constraints |
| `portals.yml` | Scanner configuration |

Do not invent metrics. Pull them from the source files.

## Onboarding

Before running any mode, confirm:

1. `cv.md` exists
2. `config/profile.yml` exists
3. `portals.yml` exists

If any are missing, enter onboarding mode:

### Step 1: CV

If `cv.md` is missing, ask for:

- CV text
- LinkedIn URL
- or a rough career summary

Create a clean markdown CV with sections for Summary, Experience, Projects, Skills, Education, and Certifications.

### Step 2: Profile

If `config/profile.yml` is missing, copy `config/profile.example.yml` and fill it with the user's details.

Collect:

- name and email
- location and timezone
- target role mix: full-time, freelance, contract, or all
- target rates and salary floors
- preferred industries and project types
- hard constraints

### Step 3: Portals

If `portals.yml` is missing, copy `templates/portals.example.yml`.

Tune:

- title filters
- tracked companies
- marketplaces and search boards
- role mix emphasis

### Step 4: Tracker

If `data/applications.md` does not exist, create:

```markdown
# Opportunity Tracker

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|
```

### Step 5: Learn The User

Ask for context that improves filtering:

- best Drupal wins
- typical project size
- preferred clients
- red flags
- migration or headless experience
- Acquia, multisite, accessibility, performance, or governance strengths
- whether the user wants more freelance, more full-time, or both

Store durable facts in `config/profile.yml` or `article-digest.md`.

## Default Positioning

Assume this fork is for a senior Drupal builder who can operate as:

- individual contributor
- technical lead
- consultant
- solutions architect
- project rescue specialist

The system should prefer opportunities where strong Drupal experience, delivery ownership, and architecture judgment matter.

## Evaluation Rules

Always score using both technical and commercial fit:

- role or project relevance
- Drupal/PHP/Symfony depth match
- delivery risk
- rate or comp fit
- client or company quality
- remote and timezone fit
- credibility of the ask
- clarity of scope

## Output Bias

Depending on the opportunity type:

- full-time role -> tailored CV + application notes
- contract role -> CV plus positioning notes
- freelance lead -> proposal outline or capability statement
- unclear inbound lead -> qualification questions first

Do not assume every lead deserves a proposal.

## Ethical Use

- Never submit anything without user review.
- Strongly discourage weak-fit opportunities.
- Do not inflate experience.
- Prefer fewer, better opportunities over volume.

## Tracker Rules

- Every evaluated opportunity should be tracked.
- Use canonical states from `templates/states.yml`.
- Never silently duplicate company plus role entries.
- Use `batch/tracker-additions/` plus merge scripts for new entries.

## Modes

| User intent | Mode |
|-------------|------|
| Paste role, project, or lead | `auto-pipeline` |
| Evaluate one opportunity | `oferta` |
| Scan sources | `scan` |
| Generate PDF | `pdf` |
| Review tracker | `tracker` |
| Fill forms or portals | `apply` |
| Outreach or follow-up | `contacto` |
| Process queue | `pipeline` |

## Operating Principle

This repo is intentionally customizable. If the user says:

- `prioritize freelance`
- `prioritize full-time`
- `focus on government Drupal`
- `focus on product companies`

edit the configuration directly instead of explaining abstractly.
