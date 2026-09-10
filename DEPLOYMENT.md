# Plesk deployment

The pilot storefront is hosted at `https://shop.tagg.gr` and its Strapi API at
`https://api.tagg.gr`. Both apps use Node.js 22 and production mode.

## Frontend

Application root: `/shop-app`; document root: `/shop-app/public`;
startup file: `app.cjs`.

Create `.env.production` on the server before running `npm run build`:

```dotenv
NEXT_PUBLIC_STRAPI_URL=https://api.tagg.gr
NEXT_PUBLIC_SITE_URL=https://shop.tagg.gr
NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_TEST_PUBLISHABLE_KEY
```

Plesk custom runtime variables are not automatically passed to its npm command
runner. Next.js embeds `NEXT_PUBLIC_*` variables during the build, so updating
runtime variables alone is insufficient. After a successful build, use Restart
App in Plesk. The Next.js configuration limits build workers to one for this host.

## Backend

Application root: `/api-app`; document root: `/api-app/public`;
startup file: `app.js`. Strapi uses MariaDB on this server. Keep database and
Strapi secrets in the server environment or private `.env`, outside `public`.

Set the following Plesk custom runtime variable:

```dotenv
NODE_OPTIONS=--disable-wasm-trap-handler
```

This avoids WebAssembly virtual-memory allocation failures under the hosting
limits. Use Plesk Restart App to manage the server; do not leave `npm start`
running in its command runner, since a second instance can occupy port 1337.

The Strapi data export has already been imported into MariaDB. Repeating an
import replaces target data. Admin users are not included in the export and
must be set up through `/admin`.
