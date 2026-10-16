# Matcharoomie waitlist hosting

## Current state — October 16, 2026

The email-only waitlist is implemented. The POST /waitlist endpoint is deployed to the existing AWS backend and a synthetic browser signup was verified in DynamoDB, then removed. Frontend publication is pending Cloudflare sign-in. The owner chose Cloudflare Pages free hosting and does not want to buy a domain or use chatgpt.site. Do not claim matcharoomie.pages.dev is reserved until project creation confirms its hostname.

The public app is prelaunch only, opening after UVA early decision results. No exact date is promised. No launch automation or emails have been scheduled.

## Frontend

- Run `npm run build` in frontend. Production env sets the public API URL and VITE_WAITLIST_ONLY=true. Upload only frontend/dist.
- The public build redirects app routes to the waitlist. Local development retains /app-preview and existing app routes.
- Cloudflare Pages supplies SPA fallback when no top-level 404.html exists. Only the static build is uploaded, never source credentials or .env files.
- Create the Pages project, record its actual pages.dev hostname, add only that exact HTTPS origin to API CORS in backend/serverless.yml, and deploy. Photo CORS stays unchanged because the waitlist does not upload photos.
- Publish with Wrangler Pages using the signed-in owner account. Verify real browser submission from the public origin, duplicate handling, narrow screens, and direct-route redirect.
- Amplify rules remain reference material; no Amplify hosting resource was created. No custom DNS or domain purchase is needed.

## Waitlist data

The existing ProfilesTable stores one private record per normalized email, using PK WAITLIST#<sha256> and SK SIGNUP. Records contain email, createdAt, and consentVersion (waitlist-v1), and no discovery index keys. No account or student profile is created. Conditional writes keep duplicates from overwriting the original timestamp.

There is no public list/export API. The owner can view these records in the AWS DynamoDB console by filtering PK to begin with WAITLIST#. Before the launch campaign, export only those records through an authenticated administrator workflow. Sending a launch email is a separate future action; the form does not send a confirmation email.

The backend remains roomie-match-backend-dev. Existing profiles and private photos remain intact. Branded Cognito emails stay disabled at the owner’s request. AWS backend usage can incur charges even when Cloudflare static hosting is free.

References: https://developers.cloudflare.com/pages/get-started/direct-upload/ and https://admission.virginia.edu/admission/deadlines-instructions
