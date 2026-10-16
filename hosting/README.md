# Matcharoomie waitlist hosting

## Current state — October 16, 2026

The email-only waitlist is implemented. The POST /waitlist endpoint is deployed to the existing AWS backend and a synthetic browser signup was verified in DynamoDB, then removed. The frontend is published at https://matcharoomie.pages.dev (Cloudflare Pages project: matcharoomie, production branch: main, deployment: 6c2fcf60). A public-origin browser signup and duplicate retry were verified; the synthetic test record was removed. The owner chose Cloudflare Pages free hosting and does not want to buy a domain or use chatgpt.site. The hostname is confirmed and API CORS allows exactly https://matcharoomie.pages.dev.

The public app is prelaunch only, opening after UVA early decision results. No exact date is promised. No launch automation or emails have been scheduled.

## Frontend

- Run `npm run build` in frontend. Production env sets the public API URL and VITE_WAITLIST_ONLY=true. Upload only frontend/dist.
- The public build redirects app routes to the waitlist. Local development retains /app-preview and existing app routes.
- Cloudflare Pages supplies SPA fallback when no top-level 404.html exists. Only the static build is uploaded, never source credentials or .env files.
- The Pages project and API CORS are configured. Photo CORS stays unchanged because the waitlist does not upload photos.
- To update, run `npx wrangler pages deploy frontend/dist --project-name matcharoomie --branch main` from the repository root using the owner’s Cloudflare login. Verify real browser submission from the canonical public origin, duplicate handling, narrow screens, and direct-route redirect. Unique deployment-preview hostnames are intentionally not allowed by API CORS.
- Amplify rules remain reference material; no Amplify hosting resource was created. No custom DNS or domain purchase is needed.

## Waitlist data

The existing ProfilesTable stores one private record per normalized email, using PK WAITLIST#<sha256> and SK SIGNUP. Records contain email, createdAt, and consentVersion (waitlist-v1), and no discovery index keys. No account or student profile is created. Conditional writes keep duplicates from overwriting the original timestamp.

There is no public list/export API. The owner can view these records in the AWS DynamoDB console by filtering PK to begin with WAITLIST#. Before the launch campaign, export only those records through an authenticated administrator workflow. Sending a launch email is a separate future action; the form does not send a confirmation email.

The backend remains roomie-match-backend-dev. Existing profiles and private photos remain intact. Branded Cognito emails stay disabled at the owner’s request. AWS backend usage can incur charges even when Cloudflare static hosting is free.

References: https://developers.cloudflare.com/pages/get-started/direct-upload/ and https://admission.virginia.edu/admission/deadlines-instructions
