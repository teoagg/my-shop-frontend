# Strapi Headless E-Commerce Frontend

Next.js 16 PWA frontend for a thesis/demo e-commerce project using a Strapi 5 headless CMS backend.

## Project Scope

- Product catalog from Strapi REST API
- Search, sorting, stock state, cart, checkout, and order history
- PWA manifest, service worker, and offline fallback
- Evaluation page for performance, security, UX, and CMS comparison notes

## Getting Started

On Windows, run `npm run dev:backend` from this frontend folder to start Strapi
with the Windows trusted root certificates available to Node.js. This fixes
`UNABLE_TO_VERIFY_LEAF_SIGNATURE` on HTTPS requests to Stripe without disabling
certificate verification. The generated `node-windows-ca.pem` is ignored by Git.

Run the Strapi backend first from `C:\Users\Thodoris\my-strapi`:

```bash
npm run develop
```

Then run the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

The shop opens at port 3000. To also run the medical website, use a separate terminal:

```bash
npm run dev:medical
```

Open [http://localhost:3001](http://localhost:3001) for the medical website.
Both use the same source project, with separate development build directories.

## Demo Data

From the backend project, run:

```bash
npm run seed:demo
```

The seed is idempotent and adds demo technology products with existing uploaded media.

## Serverless / MACH Demo

The project includes a partial composable architecture pilot under `serverless/`.
Recommendations compute their own rankings; analytics owns DynamoDB event storage; checkout remains a Strapi proxy.
See [deployment prerequisites and standalone commands](serverless/README.md).
The recommendations pilot requires a protected Strapi interaction read endpoint and a dedicated API token. The recommendation Lambda is deployed in eu-north-1; see serverless/recommendations/DEPLOYMENT.md for verification and operational details.

Run the local microservice adapter:

```bash
npm run serverless:demo
```

Then optionally point the frontend to the extracted services:

```env
NEXT_PUBLIC_RECOMMENDATIONS_URL=http://127.0.0.1:8787/recommendations
NEXT_PUBLIC_ANALYTICS_URL=http://127.0.0.1:8787/track
NEXT_PUBLIC_CHECKOUT_URL=http://127.0.0.1:8787/checkout
```

Without these variables, the frontend keeps using the Strapi endpoints directly.

## Embedded Stripe Test Payments

The checkout can also accept Stripe test card payments inside the app without
redirecting to a Stripe-hosted page. Strapi creates the PaymentIntent, Stripe.js
confirms the card payment in the browser, and Strapi saves the paid order.

Create `.env.local` in the frontend project:

```env
NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_real_publishable_key
```

Add the secret key only to the Strapi backend `.env`:

```env
STRIPE_SECRET_KEY=sk_test_replace_with_real_secret_key_from_stripe_dashboard
```

Restart both Strapi and `npm run dev`. In checkout, the card field appears in
the app. After successful payment, Strapi verifies the PaymentIntent and creates
the order with `status: paid`.

For interactive testing use Stripe test card `4242 4242 4242 4242`, any future
expiry date, any CVC, and any postal code. Never use real cards in test mode.
