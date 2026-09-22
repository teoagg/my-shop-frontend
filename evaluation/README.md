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
