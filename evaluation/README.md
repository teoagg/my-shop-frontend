# Evaluation Toolkit

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

Measured areas:

- Frontend TTFB for selected Next.js pages
- API latency for selected Strapi endpoints
- HTTP security headers
- Unauthorized access check for the protected orders endpoint
- Comparative study rows against a traditional monolithic CMS baseline

Lighthouse is intentionally optional because it is not installed in this project by default. For formal Lighthouse evidence, run Lighthouse separately and place the exported HTML/JSON files in `evaluation/reports/`.
