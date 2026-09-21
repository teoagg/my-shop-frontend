# Recommendation pilot deployment

Verified 2026-09-20. Stack: `shop-recommendations-pilot`; region: `eu-north-1`; CloudFormation status: `CREATE_COMPLETE`.

Endpoint: https://cl8xfql3yl.execute-api.eu-north-1.amazonaws.com/recommendations

AWS SAM lint validation passed. The deployed handler returned HTTP 200 with live recommendations and `meta.implementation=independent-recommendations-v1`. Strapi's new protected interaction.find route returned 403 without authentication; products remained publicly readable (200). The dedicated custom token has read permissions for products, categories, interactions and media, and expires **2026-12-19**. Renew it and update the stack before that date. Never commit the token.

Deployment used the existing AWS CloudShell session, a ZIP containing template.yaml and four runtime modules, and `sam deploy` with the template parameters. No AWS access keys were created locally. The Strapi read route was added to source and compiled with the server's installed TypeScript into dist, then Strapi was restarted. Its source counterpart is under backend-integration and is committed in teoagg/my-shop-backend as b5f5eed; future deployments from main retain the endpoint.

Initial smoke comparison: five alternating sequential request pairs for MacBook Pro, limit 4, measured from the developer workstation. Both endpoints succeeded 5/5 times. Exact ordered agreement was 0/5; this is a changed ranking implementation, not an exact behavioral replica. The first recommendation agreed, but subsequent candidates differed. Document identity, deterministic tie-breaking, full-snapshot input and fallback corrections must be accounted for in the thesis comparison. Original Strapi median: 123 ms; Lambda median: 309 ms. With only five samples, these are diagnostic observations, not a performance conclusion. Network paths, initialization and dataset mutation were not controlled. See the local evaluation/reports/lambda-comparison-20260920.json for raw results. Windows Node required system certificate trust; an earlier attempt with the system Node failed TLS and is excluded from these results.

Frontend switch completed on 2026-09-20. A separate Plesk webpack build passed compilation and TypeScript checks, then replaced the live .next. The previous .next and .env.production are preserved at /var/www/vhosts/tagg.gr/shop-before-lambda-20260920. The product page /products/macbook-pro and /evaluation returned HTTP 200, and the product page rendered the Lambda recommendation order. To roll back, restore both backup items and restart the frontend application. No claim of full-platform serverless or full MACH compliance is made: catalog, authentication, checkout and analytics persistence remain in Strapi/Plesk.

Rechecked 2026-09-21: product page HTTP 200, Lambda HTTP 200, anonymous interaction collection HTTP 403.
