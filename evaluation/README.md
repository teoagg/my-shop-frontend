# Evaluation Toolkit

## Public WooCommerce comparison

Run `python evaluation/compare-stores.py` from the repository root (Python 3,
standard library only). This reads the public Next.js and test WooCommerce
home, catalog, product and empty-cart pages without credentials or purchases.
It sends 8 warm-ups and 80 measured requests sequentially, alternating platform
order, with a one-second pause between requests. Timestamped raw JSON, CSV and
a Greek Markdown report are saved in `evaluation/reports/comparison-*/`.
The raw file is updated after each request so interrupted runs remain auditable.
Timing uses Python urllib, includes redirects and requests identity encoding;
do not merge these numbers with earlier Node.js runs as if the clients matched.
Different products, templates, draft records and hosting allocations remain
confounders. No load-test, cost advantage, or architecture-level causality is claimed.

## Website integration

After checking a completed run, publish it from the administrator shell:

```bash
python evaluation/publish-comparison.py evaluation/reports/comparison-YYYYMMDDTHHMMSSZ
```

This validates completion and sample counts, strips non-public fields, and atomically
replaces `evaluation/published/comparison-latest.json`. The `/evaluation` page reads
that snapshot without running measurements. CSV and JSON downloads are served by
`GET /api/evaluation/comparison?format=csv` (or `json`). The run endpoint requires an explicitly authorized shop user; ordinary customer
login does not authorize benchmarks. Administrator shell/Plesk publication is also supported. Preserve `evaluation/published` on deployments.
Published reports are intentionally versioned as thesis evidence and contain only
public endpoint observations. A new snapshot needs no frontend rebuild.

This folder contains repeatable measurement tooling for the thesis evaluation.

Run both local services first:

```bash
npm run dev
```

and Strapi on port `1337`, then run:

```bash
npm run evaluate
```

Generated artifacts:

- `evaluation/reports/latest.json`
- `evaluation/reports/summary.md`

For the public deployment, run from the Plesk application root with
`EVALUATION_CONFIG=evaluation/config.production.json npm run evaluate`.
The production config measures the public frontend, Strapi catalog, AWS
recommendations and AWS analytics summary. The dynamic evaluation page reads
`evaluation/reports/latest.json` at request time, so generating the report in
the application root does not require a frontend rebuild. Preserve this directory
when deploying a new build.

These are five sequential HTTP samples per URL from the execution host, without
an explicit warm-up. They do not measure browser rendering or Core Web Vitals.
The security score counts header checks; it is not a security audit. The CMS
comparison is qualitative, not a measured benchmark of a second platform.

Measured areas:

- Frontend TTFB for selected Next.js pages
- API latency for selected Strapi endpoints
- HTTP security headers
- Unauthorized access check for the protected orders endpoint
- Comparative study rows against a traditional monolithic CMS baseline

Lighthouse is intentionally optional because it is not installed in this project by default. For formal Lighthouse evidence, run Lighthouse separately and place the exported HTML/JSON files in `evaluation/reports/`.

## Administrator web runner

The evaluation page shows “Νέα μέτρηση” only after the server verifies the shop
Bearer token against Strapi `/api/users/me` and matches the returned numeric user
ID against the server-only `EVALUATION_ADMIN_USER_IDS` comma-separated allowlist.
Never grant access based on browser localStorage user details or an unverified JWT.
Set `EVALUATION_PYTHON` if Python 3 is not available as `python3`.

The POST `/api/evaluation/run` checks the Origin and uses an atomic filesystem
lock in `evaluation/reports/web-run.lock`. It starts a detached Python process,
with a 10-minute comparison timeout and five-minute interval between starts.
Only fixed public targets from compare-stores.py can be measured. GET on the same
endpoint is administrator-only and returns progress. API responses bypass the
service worker. Failed/incomplete runs retain the last published snapshot.
Reports and logs are kept under evaluation/reports, outside public/.

A server/worker crash may leave a lock. This fails closed: inspect web-run.json
and the corresponding log and verify there is no surviving worker or comparison
process before removing the lock directory. Do not auto-expire a lock while a
measurement could still run. Preserve reports and published/ across deployments.
Server measurements are labelled Plesk server and form a separate baseline from
Windows measurements. New runs do not verify product counts or cache settings.
