# Independent analytics service

Status: deployed to AWS eu-north-1 on 2026-09-21 as `shop-analytics-pilot`.

- Tracking: https://umbhnau6y8.execute-api.eu-north-1.amazonaws.com/track
- Aggregate summary: https://umbhnau6y8.execute-api.eu-north-1.amazonaws.com/summary
- Recommendations consume the private reader through IAM.

Live checks passed: durable write, duplicate replay, conflicting replay (409), invalid event (400), private reader invocation, aggregate-only summary, denied public raw reads (404), and recommendations (200). The named synthetic event was removed after verification.

The production frontend was rebuilt and activated on Plesk on the same date. A real browser visit then produced one view and four recommendation impressions in DynamoDB. The evaluation page displays the new aggregate dataset. The previous frontend build and settings are retained at `/var/www/vhosts/tagg.gr/shop-before-analytics-20260921`; the final active build ID is `InmaafxLuY4WmlBrwcFcM`.

The writer validates browser events, resolves published product identity from Strapi's read-only catalog, and stores them in DynamoDB. It does not call Strapi's interaction write endpoint. Data ownership and validation are in this service; Strapi remains the catalog source. Payments and order creation remain in Strapi.

## API and data

POST /track accepts the existing `{data:{eventType,sessionId,documentId,productId,variant,source,metadata}}` format plus optional eventId. New frontend builds generate a UUID before selecting beacon/fetch transport. Document identity takes precedence over numeric productId. Allowed events are view, add_to_cart, purchase, recommendation_impression, recommendation_click. Session length is 8–120, event IDs 16–100 alphanumeric/hyphen/underscore characters, and metadata is at most 4 KiB. Source is limited to 80 characters. Request bodies are capped at 16 KiB in the handler.

The service acknowledges only after a successful DynamoDB conditional put. Repeating the same eventId with the same normalized data returns duplicate:true and does not increment counts. Reusing it with different data returns 409. Clients without an eventId receive a generated ID and do not have retry deduplication. Purchase events are untrusted browser activity, not verified payments.

Cross-origin frontend tracking uses `fetch` with `keepalive: true` and `credentials: 'omit'`. JSON `sendBeacon` requests carry credentials and require credentialed CORS, so beacon transport is limited to same-origin endpoints. The browser transport regression tests run from the frontend root with `node --test tests/analytics-transport.test.mjs`.

GET /summary returns A/B aggregate counts and rates for the new DynamoDB dataset only. It exposes no raw sessions. The historical Strapi summary is still available at its original endpoint. Do not compare these two summaries as if they covered the same observation period.

The separate Reader Lambda has no HTTP route. Recommendation access uses IAM lambda:InvokeFunction for this specific function. It returns at most 100 raw events per page. The table is not publicly readable. The writer has PutItem/GetItem access; reader and summary functions have Scan access only. API Gateway applies rate limits (10 requests/sec, burst 20), not authentication or per-user abuse prevention. These public demo ingestion semantics do not establish that submitted behavior is trustworthy.

Records retain server creation time, event ID, event type, anonymous session ID, variant, normalized product identity, source and metadata. Raw records are not returned by public routes. No automatic expiration is configured: the retained DynamoDB table must be managed explicitly after the thesis. Point-in-time recovery is enabled. The table survives stack deletion.

## Scope and scaling

This pilot uses scans for recommendations and summaries, with a maximum of 100 pages. It does not claim production-scale analytics. Scans are not transactionally consistent across pages. Timeouts or permission failures are reported rather than converted into fake successful writes. No automatic dual-write or migration of old Strapi events occurs, so the recommendation service combines historical Strapi rows with new DynamoDB rows without migration duplicates. A rollback to Strapi tracking leaves the DynamoDB data intact; preserve the reader configuration if those events should continue to inform recommendations.

## Run and test

Node.js 20.12+ locally, Node.js 22 in Lambda. Run `npm ci` inside this folder to install the pinned AWS SDK, copy .env.example to .env, and configure the table, AWS region/credentials and Strapi origin. `npm start` exposes /track, /summary and /health on port 8788. Health checks process liveness only. Local fixture tests need no AWS credentials: `npm test`.

`npm run package` copies runtime files and dependencies into build/function. It excludes environment files. `template.yaml` defines the table, writer, reader, summary and HTTP API. The source package pins the SDK instead of relying on the Lambda runtime's bundled version.

## Deploy and connect

Run `sam validate --lint --template-file template.yaml`, then `sam deploy --guided --template-file template.yaml --resolve-s3`. Select eu-north-1 and stack name shop-analytics-pilot. Outputs contain TrackUrl, SummaryUrl, ReaderArn and TableName.

Update the existing recommendation stack with its new template/package and AnalyticsReaderArn. Retain its existing Strapi URL and token; the token is never a frontend value. Validate a reader invocation and new-event influence before enabling frontend tracking.

Set NEXT_PUBLIC_ANALYTICS_URL=TrackUrl and NEXT_PUBLIC_ANALYTICS_SUMMARY_URL=SummaryUrl before rebuilding the frontend. Keep NEXT_PUBLIC_RECOMMENDATIONS_URL pointing to the existing recommendation API. To roll back frontend tracking, remove the two analytics variables and rebuild. Keep prior frontend build and environment backups until verification is complete.

Live verification must cover invalid events, product resolution, one durable write, duplicate replay, conflicting replay, denied public raw reads, aggregates and recommendation consumption. Remove only explicitly named synthetic test events after verification.
