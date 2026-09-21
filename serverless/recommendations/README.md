# Independent recommendation service

Status: deployed to AWS Lambda and verified against live Strapi on 2026-09-20. See DEPLOYMENT.md.

This folder runs without Next.js, npm dependencies, or sibling folders. It computes recommendations itself; it never calls `/api/recommendations`. Strapi supplies published products and private interaction data. Node.js 20.12+ is required locally; the deployment template selects Node.js 22.

## Algorithm and compatibility

The original Strapi controller's weights are preserved: purchase 5, add_to_cart 3, recommendation_click 2, view 1, recommendation_impression 0.25. Sessions that interacted with the target (excluding impressions) determine collaborative candidates. Remaining slots use the same category, popularity, and latest-product fallback order.

Intentional corrections: identify products by documentId when available, exclude unavailable products before ranking, remove duplicates before filling remaining slots, and break score ties deterministically by identity. Results therefore need not exactly match the old controller. The pilot reads complete collections (maximum 100 pages of 100 requested records each) rather than the old controller's 1,000/3,000 interaction samples. It fails explicitly if the dataset is larger. This snapshot approach is suitable for a small thesis dataset, not a scalable production recommendation store. Pagination is not a transactional snapshot: concurrent changes may affect a request.

`GET /recommendations?documentId=...&limit=4` returns `{data, meta}` with existing product fields and `recommendationReason`. Numeric `productId` is supported, documentId takes precedence, and absent identifiers select the newest product. Limits clamp to 1–8. Session/variant parameters do not personalize rankings (the old algorithm did not use them either). `GET /health` checks the HTTP process only. No interaction records, session IDs, or API tokens are included in responses.

## Strapi prerequisite (Plesk backend)

The project's existing interaction router exposes track and summary, but no collection read endpoint. Copy `backend-integration/01-interaction-read.ts` to `src/api/interaction/routes/01-interaction-read.ts` in the backend repository, build and deploy it through the normal backend process.

Create a dedicated Custom API token in Strapi with only product.find, category.find, interaction.find and the media-read permissions needed for populated images. Keep interaction.find disabled for Public and Authenticated roles. The core router uses Strapi's standard authentication/permissions. Verify unauthenticated `/api/interactions` access is denied and the dedicated token can read the required populated fields. The live endpoint was installed on 2026-09-20; anonymous access returned 403 and the dedicated token successfully loaded the required data.

## Run independently

Copy `.env.example` to `.env`, configure `STRAPI_URL`, `STRAPI_API_TOKEN`, and `ALLOWED_ORIGIN`, then:

```sh
npm start
```

No install/build step is needed. Environment variables provided by the host override `.env`. The token stays on the service, never in frontend variables. HTTP startup loads the service's own `.env`; direct Lambda invocation uses configured environment variables. Plesk can start `app.cjs`, but this is ordinary Node hosting, not a Lambda deployment.

```sh
npm test
npm run package
```

Tests copy the folder outside the repository, start it against a fixture API, and invoke the Lambda handler with an HTTP API v2 event. They cover ranking, pagination, stock, duplicates, identity, methods, missing configuration, forbidden upstream access, invalid responses, and timeouts.

## AWS Lambda deployment

Prerequisites: an AWS account with deployment permissions, configured AWS credentials, AWS SAM CLI, the deployed protected Strapi read endpoint and a dedicated read token. AWS resources may incur charges.

```sh
npm run package
sam validate --lint --template-file template.yaml
sam deploy --guided --template-file template.yaml --resolve-s3
```

Supply StrapiUrl, StrapiApiToken and AllowedOrigin when prompted. Do not save the token to source control or a shared SAM configuration. The token parameter is NoEcho; it becomes a Lambda environment variable accessible to authorized AWS operators. The generated package contains only four runtime modules. The template creates a Lambda function, its execution role and an HTTP API with GET/OPTIONS routes and rate limits. Lambda has a 30-second timeout; data loading has a 20-second deadline and 5-second per-fetch timeout in AWS. Do not claim successful AWS deployment until the stack and endpoint are tested. SAM validation with --lint passed in AWS CloudShell on 2026-09-20.

Use the stack's RecommendationsUrl output as `NEXT_PUBLIC_RECOMMENDATIONS_URL` in the frontend **before rebuilding**. Leave analytics/checkout settings unchanged. To roll back, remove this variable and rebuild: the original Strapi recommendation controller remains available.

## Evaluation

Run `node compare.mjs <old-Strapi-recommendations-URL> <new-Lambda-URL> <documentId> [iterations]` against a fixed dataset. It reports sequential request latencies, errors and ordered-result agreement; different results can follow from the intentional corrections above. It does not claim statistical significance or label first-request latency as a cold start. Confirm cold starts using Lambda logs/REPORT initialization data. Separately measure whole-page TTFB and Lighthouse, and record region, dataset size, concurrency and cache conditions. An initial five-pair live smoke comparison is recorded in DEPLOYMENT.md; a controlled performance study remains outstanding.

References: [AWS SAM Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html), [Strapi REST population](https://docs.strapi.io/cms/api/rest/populate-select).
