# RoomieMatch design review

Reviewed October 15, 2026 using the apple-design skill, the local React source, and the running landing and Discover preview. The warm sakura palette, serif wordmark, restrained landing page, and profile-led desktop layout are strong. The main weakness is consistency: input, typography, and feedback need the same care as the illustration.

Keep the single-screen landing page, warm palette, branches and petals, small black swipe notes, and gentle demo return timing. The recommendations below concern usability, not a change to the brand.

## Fix list

| Priority | Finding and evidence | Change | Verification |
| --- | --- | --- | --- |
| High | Discover requires a 105px drag, resets its offset on release, and uses CSS easing for return motion. This feels unlike the responsive landing demo and drops short flicks. | Track horizontal gestures continuously, accept a modest distance or intentional flick, preserve the release position, and use an interruptible spring for cancelled drags. Keep vertical touch scrolling and prevent duplicate decisions. | Gesture regression tests, short and long browser drags, cancellation, keyboard controls, reduced motion. |
| High | SchoolPicker exposes a listbox without combobox keyboard behavior; it shows “No schools found yet” during loading and silently hides network failures. | Add arrow/Enter/Escape navigation, active-option semantics, query-specific results, explicit loading/empty/error states, and retry. | Browser keyboard selection and stale-query handling. |
| Medium | Filter tools are 32–38px and several useful labels are 9–12px. Profile metadata and the landing invitation become unnecessarily hard to read. | Raise control hit areas and small text sizes; improve size-specific tracking and responsive spacing while preserving hierarchy. | Desktop, narrow viewport, short viewport, and zoom inspection. |
| Medium | Confirmation dialogs have no accessible name; clicking blank space within the dialog can count as a backdrop click. Filters have the same backdrop ambiguity. | Name and describe dialogs, close only on a true outside click, keep focus visible, and make preference actions easy to reach. | Interior clicks, outside clicks, Escape, focus return. |
| Medium | Reduced transparency and increased contrast preferences have no treatment. Global smooth scrolling and hover movement need reduced-motion equivalents. | Add preference-specific solid surfaces, borders, and motion behavior; give controls immediate press feedback. | CSS preference checks and visual inspection. |
| Medium | Profile budget ordering is deferred to server errors; the hidden file input cannot be reached by keyboard. Form failures can scroll smoothly regardless of motion preferences. | Validate budget ordering at the field, make photo selection keyboard reachable, prevent duplicate submits, and focus the error summary. | Form validation checks, keyboard access, build. |
| Medium | Route changes scroll but do not announce a new page or move keyboard focus. Every route shares the same document title. | Add route-specific titles and focus the new main region after navigation without stealing focus from an open dialog. | Navigate across views with keyboard and inspect titles/focus. |

## Principles applied

Response and direct manipulation: motion follows the pointer, and release does not introduce a pause or reset. Agency: use familiar controls, keep errors recoverable, and preserve cancel paths. Flexibility: support keyboard, touch scrolling, text enlargement, and system preferences. Craft and restraint: improve readability without adding decoration or turning the landing page into a long marketing page.

## Scope

This is an interface review, not a backend security audit or a claim of full accessibility certification. Local sample profiles support safe interaction testing. Real likes, messages, account deletion, and profile changes are not needed for this review.

## Implementation results

All seven items in the fix list have been addressed. The landing animation timing and palette remain intact. Discover now uses an analytic, critically damped spring; the decision request waits for actual exit completion rather than an arbitrary timer. Its 48px distance threshold also accepts intentional short flicks using release velocity. The landing demo keeps its existing 12px threshold.

School search now provides a combobox, arrow/Enter/Escape interaction, current-query results, loading and retry feedback. Typography and targets are larger, dialogs distinguish interior space from backdrop clicks, routes update their titles and keyboard focus, and profile budgets validate inline. The photo picker is keyboard reachable. Preference styles are placed after the brand stylesheet so theme colors cannot override their accessible alternatives.

## Validation

- Production build and full frontend lint passed.
- All 42 regression tests passed, covering gesture direction, capture loss, fast release, vertical scroll intent, spring continuity and frame-rate independence, landing layer order, and dialog hit testing.
- Chrome: 60px left and right Discover drags committed, the next profile appeared, and the sample match banner appeared after liking Alex. Keyboard school search selected Virginia Tech using ArrowDown and Enter.
- Local profile form: a $500 maximum against a $650 minimum displayed an inline error and failed native validity; correcting it to $950 allowed a sample save. No real profile was changed.
- Responsive inspection: landing at 390×844 and 900×520 remained one viewport; the 390px Discover page had no horizontal overflow. Filters adapted to one column with sticky actions, and Escape restored focus to the Filters button.
- Reduced-motion spring handling and contrast/transparency stylesheet order were reviewed in code. OS-level preference switching, physical touch-device behavior, and a full screen-reader session remain manual follow-up checks; browser viewport emulation does not certify these.

## Rechecking locally

From `frontend`, run `npm run build`, `npm run lint`, and `node --test tests/*.test.mjs` (Node with TypeScript stripping support). `npm run dev` exposes `/design-preview` for sample Discover cards and `/design-preview?view=profile` for a local-only profile form. These routes are development-only; sample saves and photo previews do not write to an account.

The signed-in account routes were unavailable in this browser session, so account-specific layout code was inspected and shared components were exercised in the local preview. No real likes, messages, account deletion, or backend data changes were made.
