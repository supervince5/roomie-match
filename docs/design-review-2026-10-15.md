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

Implementation and validation results will be recorded below as the fixes land.
