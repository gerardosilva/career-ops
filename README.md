# Career-Ops

> AI-assisted opportunity pipeline for Drupal professionals. Evaluate full-time roles, freelance contracts, retainers, and inbound leads from one workflow.

![Claude Code](https://img.shields.io/badge/Claude_Code-000?style=flat&logo=anthropic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat&logo=playwright&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## What This Fork Optimizes For

This fork is tuned for a Drupal developer who works across:

- full-time remote roles
- contract and freelance projects
- long-term retainers
- partner referrals and inbound leads
- migration, modernization, and headless Drupal work

Instead of assuming AI product roles, the default scoring, keywords, and tracker now focus on Drupal delivery fit:

- Drupal and PHP relevance
- project scope clarity
- budget and rate fit
- delivery risk
- team and client quality
- proposal or application strategy

## Core Workflow

1. Paste a job post, RFP, lead note, or URL.
2. Career-Ops classifies the opportunity.
3. It evaluates fit, budget, delivery risk, and positioning.
4. It generates a report plus a tailored PDF asset.
5. It tracks the opportunity in a single pipeline.

The PDF can still be a tailored CV for full-time roles, but the fork also supports capability statements and proposal-oriented framing for freelance work.

## Default Opportunity Types

- Senior Drupal Developer
- Lead Drupal Engineer
- Drupal Technical Lead
- Drupal Consultant
- Drupal Solutions Architect
- Headless Drupal Engineer
- Fractional Drupal Lead
- Drupal Migration Specialist

## Quick Start

```bash
git clone https://github.com/santifer/career-ops.git
cd career-ops
npm install
npx playwright install chromium

cp config/profile.example.yml config/profile.yml
cp templates/portals.example.yml portals.yml
```

Then create:

- `cv.md` with your CV in markdown
- `article-digest.md` with project proof points, case studies, migrations, performance wins, and notable clients

## Install As A Skill

This fork ships a portable skill in `skills/career-ops/`.

To link it into both Codex and OpenClaw on the current machine:

```bash
./scripts/install-skills.sh
```

Open Claude Code in this directory and ask it to adapt anything that still feels off:

```bash
claude
```

Examples:

- `Change the archetypes to focus on government and higher-ed Drupal roles`
- `Add these 10 agencies and consultancies to portals.yml`
- `Shift the scoring to prioritize remote full-time roles over short contracts`
- `Generate a capability statement instead of a resume for this lead`

## Usage

```text
/career-ops                -> Show commands
/career-ops {paste input}  -> Full pipeline for a role, contract, or lead
/career-ops scan           -> Scan configured sources for new opportunities
/career-ops pdf            -> Generate a tailored CV or capability PDF
/career-ops batch          -> Evaluate multiple opportunities
/career-ops tracker        -> Review pipeline state
/career-ops apply          -> Assist with live forms or proposal portals
/career-ops pipeline       -> Process queued URLs
/career-ops contacto       -> Draft outreach or follow-up messages
/career-ops deep           -> Deep company or client research
```

## What Changed From Upstream

- Default archetypes now target Drupal delivery, consulting, and technical leadership.
- Scanner keywords now include Drupal, PHP, Symfony, Acquia, migrations, headless, and accessibility.
- Negative filters no longer exclude PHP.
- Tracker states now fit both freelance and full-time pipelines.
- Outreach and PDF instructions now handle both proposal-led and job-application flows.

## Suggested Sources

The default config is biased toward places a Drupal developer can realistically find work:

- Drupal vendors and consultancies
- remote engineering job boards
- freelance marketplaces
- contract-focused platforms
- LinkedIn and general role aggregation via site filters

## Dashboard

The Go dashboard still works as a terminal pipeline viewer:

```bash
cd dashboard
go build -o career-dashboard .
./career-dashboard
```

## License

MIT
