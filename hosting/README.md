# Matcharoomie hosting preparation

Status: prepared locally, not published. As of October 16, 2026, matcharoomie.com is registered and the owner of this app has not purchased it. Do not request its certificate, add it to API/S3 CORS, or modify DNS without confirmed control of the domain.

## Prepared

- `frontend/.env.production` provides the existing public API URL. The previous production build had no API URL because it only existed in `.env.development`.
- Vite rejects builds with a missing or malformed API URL.
- `amplify-rules.json` supplies the SPA rewrite for direct navigation to login, discovery, and profile routes; static assets remain static.
- Invite links use the actual website origin unless `VITE_PUBLIC_SITE_URL` is explicitly configured. No unowned domain is embedded.

## Before publication

1. Confirm an owned domain, or obtain approval for a temporary hosting address and hosting costs. AWS Amplify is a candidate because the backend already uses AWS; no hosting provider has been purchased or created.
2. Label existing `seed-` sample profiles clearly in cards and person rows before inviting real users. Keep the samples until the owner requests removal; no profile deletion is authorized now.
3. Build and lint the frontend. Upload only `frontend/dist`, never source files, credentials, or `.env` files. Configure the SPA rewrite.
4. Add only the verified HTTPS hosting origin to API Gateway and private photo-bucket CORS in `backend/serverless.yml`, then deploy that change. Preserve private photos and authentication.
5. Verify HTTPS, direct route refresh, signup/verification/login, profile editing, photo uploads, discovery, and invites on the actual hosted origin. Existing local and unit checks do not establish a successful live launch.
6. For a custom domain, add the hosting provider's exact certificate-validation and routing DNS records at its registrar. Wait for certificate and DNS verification before redirecting visitors.

The existing backend is the `roomie-match-backend-dev` stack. Keep its resource names and data intact during the brand/hosting changes. Branded email remains disabled at the owner's request.

Reference: https://docs.aws.amazon.com/amplify/latest/userguide/redirect-rewrite-examples.html
