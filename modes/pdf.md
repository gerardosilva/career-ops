# Mode: pdf — PDF Generation

Generate the right asset for the opportunity:

- tailored CV
- capability statement
- technical one-pager

## Workflow

1. Read `cv.md`, `article-digest.md`, and `config/profile.yml`.
2. Detect the opportunity type.
3. Extract the relevant keywords from the role or brief.
4. Choose the format:
   - full-time -> CV
   - contract -> CV or one-pager
   - freelance -> capability statement or proposal summary
5. Rewrite the summary without inventing experience.
6. Prioritize the most relevant projects and proof points.
7. Create `output/{company-slug}/{YYYY-MM-DD}-{role-slug}/`.
8. Generate HTML and then PDF inside that folder.

## Core Rule

Do not inject false keywords. Only reframe real experience using language that is closer to the opportunity.
