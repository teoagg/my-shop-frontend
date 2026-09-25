# Thesis Evidence Checklist

This file maps the latest implementation state to the improvement points raised by the supervisor.

## 1. Online Availability

| Evidence | Location |
| --- | --- |
| Public storefront | https://shop.tagg.gr |
| Public evaluation dashboard | https://shop.tagg.gr/evaluation |
| WooCommerce baseline | https://woo.tagg.gr |

The application is available online, so committee members can inspect the storefront and the evaluation page before the presentation.

## 2. GitHub Readiness

| Requirement | Repository Evidence |
| --- | --- |
| README | `README.md` |
| Installation guidelines | `docs/INSTALLATION.md` |
| Architecture overview | `docs/ARCHITECTURE.md` |
| Deployment notes | `DEPLOYMENT.md` |
| Evaluation workflow | `evaluation/README.md` |
| Serverless/MACH pilot notes | `serverless/README.md` |

Recommended screenshots for the final GitHub repository:

- Storefront home page.
- Product catalog with images.
- Cart and embedded Stripe checkout.
- Orders page.
- Evaluation dashboard.
- WooCommerce comparison section.
- Strapi admin content type view.
- High-level architecture diagram.

## 3. Bibliography and Academic Documentation

The thesis document has been updated separately with:

- Recent scientific references for headless commerce, composable commerce, CMS evaluation, web performance, and recommender systems.
- A clearer literature gap and contribution statement.
- More uniform bibliography formatting.
- Separate official documentation references for frameworks, APIs, payment processing, security, and evaluation tools.

## 4. Formatting Improvements

The thesis document has been updated separately with:

- More consistent bibliography style.
- Word-native tables for visibility.
- Cleaner captions and comparison tables.
- A local improvement logfile documenting the changes.

## 5. CMS Comparison

| Evidence | Location |
| --- | --- |
| Published section | https://shop.tagg.gr/evaluation#woocommerce-comparison |
| JSON export | https://shop.tagg.gr/evaluation/woocommerce-comparison.json |
| CSV export | https://shop.tagg.gr/evaluation/woocommerce-comparison.csv |
| Toolkit documentation | `evaluation/README.md` |

The comparison uses the current Next.js + Strapi storefront and a WooCommerce baseline. It supports experimental discussion of performance, security headers, operational characteristics, and architectural trade-offs.

## FR/NFR Traceability

The thesis document has been updated separately with a traceability section that links:

- Functional requirements to implemented application areas.
- Non-functional requirements to evaluation results, security checks, deployment notes, and measured evidence.

