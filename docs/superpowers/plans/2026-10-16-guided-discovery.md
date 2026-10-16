# Guided discovery implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: use executing-plans to implement this plan task-by-task.

**Goal:** a welcoming optional setup and precise swipe feedback, preserving profile-first browsing.
**Architecture:** a standalone GuidedDiscovery component owns transient wizard state and calls an injected async completion callback. DiscoverPage owns persistence, profile/filter semantics, first-visit hint and the existing advanced dialog. Motion handles the screen transitions and reduced-motion alternative.
**Tech Stack:** React, TypeScript, Motion, native dialog, existing SchoolPicker and API/cache helpers.
**Spec:** ../specs/2026-10-16-guided-discovery.md

## Global constraints
- Existing palette, lowercase interface copy, preserve personal input casing.
- No automatic questionnaire, no field count, no blocking animation delays.
- Keep advanced filters and normal Discovery swipe behavior.
- Do not wire ambiguous personal data writes before resolving the user question.
- Local commits for iterations; no push or deployment.

## Review focus
- Reopen/back/rapid next: preserve values and focus, no duplicate saves.
- Storage unavailable or another account: hint and completion state remain isolated.
- School search fails: retry available; arbitrary input cannot become a school id.
- Save fails or user exits during request: retain values and avoid stale navigation.
- Reduced motion/mobile: no greeting loop, no clipped keyboard controls or inaccessible outgoing fields.

### 1. Landing reaction placement
- [ ] Adjust geometry regression for middle/lower-side placement with actual wordmark and CTA obstacles.
- [ ] Change landingReactionPlacement and LandingDemos measurements; verify desktop/mobile and checkpoint.

### 2. Guided sheet and hint
- [ ] Create components/GuidedDiscovery.tsx, guided-discovery.css and lib/guidedDiscovery.ts with field validation, typed values, scoped local persistence helpers.
- [ ] Tests: blank name, invalid college, optional cleanliness, storage errors, account isolation.
- [ ] Native dialog with accessible heading/focus, Motion greeting, one field at a time, back/close and optional skip. onComplete(values) async contract; pending and retry states.
- [ ] Integrate hint and open/close state in DiscoverPage; reuse existing full filter dialog after setup completion. Add preview support without real profile writes.
- [ ] Run build/lint/browser flow and checkpoint.

### 3. Save semantics and verification
- [ ] Resolve user answer. If own-profile details, explicitly preserve all existing profile fields and photos; save through current profile API, update cache and reload feed. If filters-only, never mutate profile; label values as browsing choices.
- [ ] Test save payload preservation and filter mapping, and retry failures in local preview.
- [ ] Check initial visit, greeting, keyboard flow, school picker, back, close, optional skip, final save, reopen advanced filters, repeat visit, mobile and reduced motion.
- [ ] Fresh final review, address material findings, complete tests and checkpoint. Keep localhost available.
