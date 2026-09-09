# Serverless / MACH Demo

This folder demonstrates how the platform can move toward a composable MACH architecture without replacing Strapi.

## What is extracted

- `recommendations`: independent recommendation microservice
- `analytics`: independent interaction tracking microservice
- `checkout`: independent checkout orchestration microservice

Each handler follows a Lambda-style shape:

```js
export async function handler(event) {
  return {
    statusCode: 200,
    headers: {},
    body: JSON.stringify({})
  }
}
```

The same handlers can be adapted to:

- AWS Lambda + API Gateway
- Azure Functions HTTP triggers
- Vercel/Netlify functions
- Dockerized microservices

## Local Demo

Run Strapi first on port `1337`, then start the local serverless adapter:

```bash
npm run serverless:demo
```

Optional frontend env vars:

```env
NEXT_PUBLIC_RECOMMENDATIONS_URL=http://127.0.0.1:8787/recommendations
NEXT_PUBLIC_ANALYTICS_URL=http://127.0.0.1:8787/track
NEXT_PUBLIC_CHECKOUT_URL=http://127.0.0.1:8787/checkout
```

With these variables, the Next.js app uses the serverless microservices. Without them, it falls back to the existing Strapi endpoints.

## MACH Mapping

- Microservices: recommendation, analytics, checkout are independently deployable.
- API-first: services communicate through JSON over HTTP.
- Cloud-native: handlers are portable to Lambda/Azure Functions.
- Headless: Strapi remains the CMS/content API, while Next.js remains the frontend.
