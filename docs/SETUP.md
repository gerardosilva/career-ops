# Setup Guide

## Prerequisites

- Claude Code
- Node.js 18+
- Playwright Chromium
- Optional: Go 1.21+ for the dashboard

## Install

```bash
git clone https://github.com/santifer/career-ops.git
cd career-ops
npm install
npx playwright install chromium
```

## Configure

```bash
cp config/profile.example.yml config/profile.yml
cp templates/portals.example.yml portals.yml
```

Then create:

- `cv.md`
- `article-digest.md` if you have case studies, project summaries, or measurable wins

## What To Put In `profile.yml`

- full-time target roles
- contract and freelance target roles
- rate and salary expectations
- preferred industries
- timezone and remote constraints
- proof points and positioning

## What To Put In `portals.yml`

- Drupal and adjacent keywords
- job boards and freelance platforms you care about
- agencies, consultancies, vendors, and product companies to track

## First Run

Open Claude Code in the repo and give it one real opportunity:

```bash
claude
```

Examples:

- paste a job description
- paste an Upwork brief
- paste a referral note
- run `/career-ops scan`

## Validation

```bash
node cv-sync-check.mjs
node verify-pipeline.mjs
```

## Optional Dashboard

```bash
cd dashboard
go build -o career-dashboard .
./career-dashboard
```
