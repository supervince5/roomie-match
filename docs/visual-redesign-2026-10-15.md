# RoomieMatch visual redesign — October 15, 2026

This pass follows the Apple Design interaction review in `design-review-2026-10-15.md`. It changes the visual composition substantially while retaining the existing account, matching, filtering, swipe, and scrolling behavior.

## Direction

Keep the user's sakura palette: butter `#FFFAD3`, apricot `#FFDBB0`, peach `#FFCCB8`, and pink `#FFB1B1`. Use deep green `#283E34` for primary actions and selected text, as requested during the redesign. Large surfaces stay light; the sign-in panel uses peach, not green. Retain the rm doorway mark, branches, falling petals, and the playful single-screen landing.

## Review and changes

| Before | Implemented |
| --- | --- |
| The auth illustration, gradient, slogan, and oversized empty space competed with the form. | A purposeful split layout, bold sans-serif hierarchy, compact roommate details, and a quiet form column. Removed the decorative arch and repeated icon. |
| Floating landing demos felt disconnected from the invitation and campus strip. | A desktop composition with invitation on the left, interactive examples on the right, and a full-width campus band. Narrow layouts stack the same elements without page scrolling. |
| Discover led with metadata, and the empty-photo illustration competed with the person. | Name and photo area remain prominent; personal bio and interests come before practical details. Clear typographic fallback for missing photos, simpler quote treatment, and readable spacing. |
| Navigation, forms, tags, buttons, and dialogs used inconsistent shapes and typography. | Shared tokens in `design-system.css`, an understated active navigation underline, consistent control dimensions, open form sections, and aligned profile detail grids. |
| Responsive checks exposed a marquee expanding the implicit grid column and a footer collision in short windows. | Constrain the page's grid column and marquee minimum widths; compact the demo region on short screens. Each correction has its own commit. |

## Interaction details retained

- Direct manipulation and immediate feedback, including short left and right landing drags without holding.
- Gentle card return beneath the pile; the next card advances. No landing arrow-key shortcuts were added.
- Idle motion resumes when permitted; hover, pause, keyboard focus, reduced motion, and hidden tabs retain their existing handling.
- Discover's interruptible spring and black, unboxed swipe notes remain intact.
- Dialog focus return, named controls, keyboard school selection, validation, and reduced-motion/transparency/contrast treatments remain in place.
- Destructive controls retain their distinct red treatment.

## Verification

- Production build and ESLint pass; all 42 existing regression tests pass.
- Browser: quick 70px right and left landing drags immediately entered the exit phase and announced the corresponding like/pass. Both idle controllers resumed after Play.
- Browser: filter dialog opened, Cancel closed it, and focus returned to Filters.
- Browser: signup navigation worked; the local sample profile submitted successfully without writing to an account.
- Visual inspection at desktop 1710px, laptop 1280×800, short laptop 900×520, mobile 390×844, and narrow 320×568. Landing stays within one viewport; mobile Discover and signup have no horizontal overflow.
- Before/after screenshots captured for landing, login, and sample Discover. Login uses the same 1710×985 frame for both captures. A separate browser session keeps the final login capture free of account autofill.
- Screenshot files and comparison gallery are saved in the task's `outputs` directory as `redesign-before-*.jpg`, `redesign-after-*.jpg`, and `roomiematch-before-after.html`.

Real signup, password changes, likes, messages, and uploads were not submitted. System preference handling was inspected in code; physical touch hardware and a full screen-reader session were not exercised in this pass.
