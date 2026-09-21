# Composable architecture pilot

`recommendations/` now owns the ranking algorithm and reads raw products/interactions from Strapi. Its folder runs independently and includes an AWS SAM template, tests, packaging and an evaluation script. See its README for the protected backend endpoint prerequisite and deployment instructions. The recommendation Lambda is deployed in eu-north-1; see recommendations/DEPLOYMENT.md for verification and operational details.

`analytics/` and `checkout/` are independently runnable **Strapi proxies**, not extracted business services. Each has its own runtime, package.json, .env.example and HTTP entry point. They still forward to `/api/interactions/track` and `/api/orders`. Stripe payment endpoints remain in Strapi.

## Independent HTTP processes

From each folder, copy .env.example to .env, set the existing Strapi URL and the frontend origin, and run `npm start`. Recommendations also requires a dedicated Strapi read token. No npm dependencies or frontend checkout are required once a service folder is copied elsewhere.

| Folder | Default port | Endpoint |
| --- | --- | --- |
| recommendations | 8787 | GET /recommendations |
| analytics | 8788 | POST /track |
| checkout | 8789 | POST /checkout (existing user's Bearer JWT required) |

Each HTTP process exposes GET /health. Configure PORT, HOST, ALLOWED_ORIGIN and UPSTREAM_TIMEOUT_MS as needed. The small runtime module is intentionally bundled in each folder for copy-alone deployment.

Set these frontend values before rebuilding:

```env
NEXT_PUBLIC_RECOMMENDATIONS_URL=http://127.0.0.1:8787/recommendations
NEXT_PUBLIC_ANALYTICS_URL=http://127.0.0.1:8788/track
NEXT_PUBLIC_CHECKOUT_URL=http://127.0.0.1:8789/checkout
```

Use HTTPS service URLs when deploying the public frontend. Leaving a variable unset retains that feature's original Strapi endpoint. For the Lambda pilot, set only the recommendations URL.

The legacy `npm run serverless:demo` command hosts all three routes on one port (8787 by default). Supply STRAPI_URL and STRAPI_API_TOKEN to that process. It does not automatically load each service's .env.

This is a partial composable transition. Separate Node processes on Plesk are not serverless infrastructure. A function-shaped handler alone is not evidence of deployment to Lambda/Azure, and the whole shop is not claimed to be fully MACH.
