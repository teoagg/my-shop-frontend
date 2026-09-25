# Installation Guide

This guide is intended for thesis reviewers or committee members who want to run the project locally.

## Prerequisites

- Node.js compatible with the project dependencies.
- npm.
- The Strapi backend project available at `C:\Users\Thodoris\my-strapi`.
- Optional Stripe test account for embedded payment testing.

## 1. Backend Setup

Open a terminal in the Strapi backend folder:

```bash
cd C:\Users\Thodoris\my-strapi
npm install
npm run develop
```

The backend should be available at:

```text
http://127.0.0.1:1337
```

To seed demonstration products:

```bash
npm run seed:demo
```

## 2. Frontend Setup

Open a second terminal in this repository:

```bash
cd C:\Users\Thodoris\my-shop-frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=http://127.0.0.1:1337
NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_replace_with_real_publishable_key
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 3. Stripe Test Checkout

Add the Stripe secret key only in the Strapi backend `.env`:

```env
STRIPE_SECRET_KEY=sk_test_replace_with_real_secret_key_from_stripe_dashboard
```

Restart both applications. The checkout page should display an embedded card form. Use Stripe test card:

```text
4242 4242 4242 4242
```

Use any future expiry date and any CVC.

## 4. Optional Serverless Adapter

The local adapter demonstrates function-style service boundaries for recommendations, analytics, and checkout:

```bash
npm run serverless:demo
```

Then set:

```env
NEXT_PUBLIC_RECOMMENDATIONS_URL=http://127.0.0.1:8787/recommendations
NEXT_PUBLIC_ANALYTICS_URL=http://127.0.0.1:8787/track
NEXT_PUBLIC_CHECKOUT_URL=http://127.0.0.1:8787/checkout
NEXT_PUBLIC_ANALYTICS_SUMMARY_URL=http://127.0.0.1:8787/analytics/summary
```

Without these variables, the frontend continues to use Strapi endpoints directly.

## 5. Evaluation Toolkit

Run the evaluation workflow from the frontend repository:

```bash
npm run evaluate
```

The published production comparison is available at:

```text
https://shop.tagg.gr/evaluation#woocommerce-comparison
```

Exported datasets:

```text
https://shop.tagg.gr/evaluation/woocommerce-comparison.json
https://shop.tagg.gr/evaluation/woocommerce-comparison.csv
```

More details are documented in `evaluation/README.md`.

