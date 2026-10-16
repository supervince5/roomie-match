# Guided discovery implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: use executing-plans to implement this plan task-by-task.

**Goal:** a welcoming optional setup and precise swipe feedback, preserving profile-first browsing.
**Architecture:** a standalone GuidedDiscovery component owns transient wizard state and calls an injected async completion callback. DiscoverPage owns persistence, profile/filter semantics, first-visit hint and the existing advanced dialog. Motion handles the screen transitions and reduced-motion alternative.
**Tech Stack:** React, TypeScript, Motion, native dialog, existing SchoolPicker and API/cache helpers.
**Spec:** ../specs/2026-10-16-guided-discovery.md

## Global constraints
- Existing palette, lowercase interface copy, preserve personal input casing.
- No automatic questionnaire in Discovery, no field count, no blocking animation delays. Signup starts guided basics on Profile.
- Keep advanced filters and normal Discovery swipe behavior.
- Confirmed: missing name/college/major update own profile; roommate cleanliness changes Discovery filters.
- Local commits for iterations; no remote push. Backend deployment explicitly approved and completed October 16.

## Review focus
- Reopen/back/rapid next: preserve values and focus, no duplicate saves.
- Storage unavailable or another account: hint and completion state remain isolated.
- School search fails: retry available; arbitrary input cannot become a school id.
- Save fails or user exits during request: retain values and avoid stale navigation.
- Reduced motion/mobile: no greeting loop, no clipped keyboard controls or inaccessible outgoing fields.

### 1. Landing reaction placement
- [x] Adjust geometry regression for middle/lower-side placement with actual wordmark and CTA obstacles.
- [x] Change landingReactionPlacement and LandingDemos measurements; verify desktop/mobile and checkpoint.

### 2. Guided sheet and hint
- [x] Create components/GuidedDiscovery.tsx, guided-discovery.css and lib/guidedDiscovery.ts with field validation, typed values, scoped local persistence helpers.
- [x] Tests: blank name, invalid college, optional cleanliness, storage errors, account isolation.
- [x] Native dialog with accessible heading/focus, Motion greeting, one field at a time, back/close and optional skip. onComplete(values) async contract; pending and retry states.
- [x] Integrate hint and open/close state in DiscoverPage; reuse existing full filter dialog after setup completion. Add preview support without real profile writes.
- [x] Run build/lint/browser flow and checkpoint.

### 3. Save semantics and verification
- [x] Resolve user answer. If own-profile details, explicitly preserve all existing profile fields and photos; save through current profile API, update cache and reload feed. If filters-only, never mutate profile; label values as browsing choices.
- [x] Test save payload preservation and filter mapping; inspect error handling so failed saves retain values and expose retry.
- [x] Check greeting, keyboard flow, school picker, back, close, optional skip, final sample save, reopen advanced filters, repeat visit and mobile. Review reduced-motion and first-visit storage branches in source/tests.
- [x] Fresh final review, address material findings, complete tests and checkpoint. Keep localhost available.

## Verification and deployment record

- Frontend: production build, ESLint, 57 tests passed. Backend: 10 tests passed, including minimal profiles and validation of supplied optional fields.
- Browser: completed standalone and Filters-triggered sample setup, keyboard college selection, Back preserving values, optional preference skip, completion applying cleanliness, advanced-filter reopening, guide reopening skipping already-filled basics, repeat visit opening on a profile.
- Reviewed first-visit styling eagerly loaded, account-scoped storage, async duplicate-submit guard and profile payload preservation. Fresh reviewer findings (lazy hint CSS and missing reopen entry) resolved.
- Verified mobile greeting/input at 390px in a temporary iframe fixture because browser viewport overrides did not change the rendered width. Fixture removed. Reduced-motion behavior inspected in source; no OS preference was changed. A real account was not created or edited for testing, and network save-failure injection was not performed.
- Owner screenshot exposed caption collision. Added both demo captions to protected obstacles, bounded the rotated note to visible space, and suppress decorative ink if no clear location exists. Geometry regression and 880px browser check pass.
- Deployed createProfile, updateProfile and discover to the existing dev service in us-east-1. All report Active / Successful. Health returned 200 with the current 127.0.0.1 preview origin allowed. Added that origin to serverless.yml and the live API alongside localhost; no authentication or IAM changes. No frontend production deploy and no Git push.
