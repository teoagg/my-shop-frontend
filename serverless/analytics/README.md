# Analytics service

This directory is independently runnable and deployable. It has no npm dependencies and no imports from the rest of the repository. Requires Node.js 20.12 or later.

1. Copy `.env.example` to `.env` and set `STRAPI_URL` to the existing Strapi origin.
2. Set `ALLOWED_ORIGIN` to the frontend origin (use `http://localhost:3000` for development).
3. Run `npm start` in this directory. No build or package installation is needed.

Endpoint: `POST /track`. Default port: `8788`. `GET /health` checks the service process; it does not check Strapi connectivity. Hosting environment variables take precedence over `.env`.

For Plesk, use this folder as the application root and `app.cjs` as the startup file. Configure environment variables in the hosting panel. The HTTP process uses the host-provided `PORT`.

For AWS Lambda with an HTTP API Gateway proxy event, upload this folder and select `handler.handler` as the handler. Set environment variables in the function configuration; `.env` is loaded only by the HTTP entry point. Other function providers need their own request/response adapter.

Strapi remains responsible for the existing business logic, persistence, and authentication. This service requires its project-specific Strapi endpoint. See the parent README for the API contract and frontend integration.
