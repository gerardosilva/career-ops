# Mode: evaluate — Full Evaluation

When the user shares an opportunity, always deliver these blocks:

## Block A — Summary

Provide a table with:

- opportunity type
- archetype
- seniority
- remote/hybrid/onsite
- budget or compensation
- timeline or urgency
- TL;DR

## Block B — Experience Match

Read `cv.md` and `article-digest.md`.

Map each requirement or need to real experience:

- Drupal core and contrib
- PHP/Symfony
- architecture
- migrations
- leadership
- client-facing work

Include gaps and mitigation.

## Block C — Commercial Fit

Evaluate:

- scope clarity
- client or company quality
- budget or rate fit
- scope creep risk
- realistic closing probability
- location eligibility and remote compatibility

Mandatory financial rule:

- for full-time roles, compare against `target_salary_usd` and `minimum_salary_usd` in `config/profile.yml`
- for contract or freelance work, compare against `freelance_realistic_hourly_rate_usd`, `freelance_realistic_minimum_hourly_rate_usd`, and `freelance_realistic_day_rate_usd`
- do not use the salary-equivalent hourly rate to judge freelance work
- if compensation is missing, mark that as a risk and lower the commercial score
- if the opportunity is not remote-friendly or appears to exclude candidates working from Mexico or Latin America, lower the score heavily or discard it

## Block D — Strategy

Define the best next step:

- apply
- send a message
- request a discovery call
- send a capability statement
- prepare a proposal
- discard

If the budget is below the floor:

- full-time below `$4,200 monthly` -> recommend negotiating or discarding
- freelance or contract below `$40/h` or the equivalent day rate -> recommend discarding unless there is a strong strategic reason

If location fit is below the floor:

- on-site or geography-restricted roles that do not allow Mexico or LATAM -> recommend discarding by default
- remote roles with unclear geography -> treat as uncertain and require verification before recommending a strong next step

## Block E — Personalization

List the top changes for:

- CV
- LinkedIn
- capability statement
- proposal or intro email

When recommending or generating email/application copy in English:

- avoid resume-voice lines like `I am applying` and `my background fits well` by default
- favor a concrete reason for reaching out tied to the actual role or company
- keep the tone natural, direct, and human
- make it sound like an experienced developer writing, not a formal template

## Block F — Discovery / Interview Pack

Prepare:

- discovery or interview questions
- stories and proof points to use
- likely objections
- compensation or rate positioning

## After Evaluation

Save the report and register the opportunity in the tracker with status `Qualified`.
