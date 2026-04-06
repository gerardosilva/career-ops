# Mode: scan — Opportunity Discovery

Scan configured sources and add new opportunities to the pipeline.

## Sources

- full-time job boards
- contract job boards
- freelance marketplaces
- Drupal vendors and consultancies
- companies with serious Drupal or CMS roles

## Workflow

1. Read `portals.yml`
2. Read `data/scan-history.tsv`
3. Read `data/applications.md` and `data/pipeline.md`
4. Run tracked companies
5. Run search queries
6. Filter using `title_filter`
7. Apply `geo_policy` and `banned_companies` from `portals.yml`
8. Deduplicate
9. Add new opportunities to `pipeline.md`

## Filter Rule

An opportunity is relevant if:

- it clearly mentions Drupal or a very close adjacent keyword
- it is not obviously for another specialty
- it fits full-time, contract, or freelance work
- it is remote-friendly and does not explicitly exclude candidates working from Mexico or Latin America
- its company is not listed in `banned_companies`

## Geo Rule

Default to rejecting or skipping opportunities that:

- require on-site work
- require residence only in the United States or another restricted geography
- explicitly exclude Mexico, LATAM, or international candidates

When the geography is unclear, keep the opportunity only if the rest of the signal is strong and mark location fit as unconfirmed.

## Output Summary

```text
Portal Scan — {YYYY-MM-DD}
Opportunities found: N
Relevant: N
Duplicates: N
Added to pipeline: N
```
