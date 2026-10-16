# Matcharoomie design preferences

Confirmed by the owner, October 16, 2026. Read these before changing the interface.

- Preserve the original cream, butter, apricot, peach, sakura pink, and dark-green palette. Existing CSS variables are the source of truth.
- Keep **matcharoomie.** as the central landing-page focal point, in the existing editorial serif. The owner renamed the product on October 16. Use a small ceramic matcha bowl logo with a sakura petal; retain the original visual style.
- Aim for minimal, cozy, playful design. The Matcharoomie rebrand adds restrained matcha green (#65774d) and pale tea green (#e6ecd8), alongside the existing pink, cream, and dark green. Preserve the layout, typography, and motion; avoid elaborate scenes or generated portrait mockups.
- Use lowercase interface copy. Preserve the casing of members' supplied names, personal content, and typed values.
- Vary scale deliberately: large wordmark, medium profile cards, smaller scroll previews, quiet utility controls. Do not make every element the same size.
- Preserve the existing swipe physics and idle timings. Falling petals vary in size, delay, duration, and drift. Motion should feel varied and natural rather than synchronized.
- Page transitions are short native crossfades with a small settling movement: 130ms outgoing, 280ms incoming, 6px travel. Navigation must stay responsive and interruptible. Reduced motion removes route movement.
- Non-Discovery pages gently reveal content after loading: lists 340ms, profiles 400ms, search 220ms, with at most 5px travel. Do not add this reveal to Discovery. Refreshes must not remount interactive content.
- Swipe reaction text appears toward the gesture direction and fades in, holds briefly, and fades out over 3.3 seconds. Place it inside the card, between its center and the swipe side (35%/65% across), around the middle-to-lower part of the visible card. Vary position only slightly (never high above it), and give each gesture a noticeable randomized 7–14° tilt. Clamp its rotated bounds to the viewport. Show one reaction per swipe; the match banner handles mutual-match confirmation without restarting the reaction.
- Landing sample reactions sit just outside the stack with a small gap, never over cards or the central wordmark. Measure the actual wordmark, subtitle, button and adjacent preview separately; do not block the whole central column. When the side is crowded, use the nearest lower-side corner with only an 8px gap. Keep randomized tilt and avoid consecutive repeated phrases. Treat both demo captions as protected obstacles too; never cover “try a swipe.” If no collision-free visible position exists, omit decorative ink and retain the accessible swipe announcement.
- Discovery opens directly on a profile. Filters remain optional, nearby, and preserve saved choices. Keep swipe and scroll browsing.
- On the first Discovery visit, point gently to filters; never open setup automatically there. The first filters click opens a compact, left-aligned preferences drawer (a bottom sheet on mobile), with shared-space and daily-rhythm choices one at a time. No greeting, profile questions, or step count. Later clicks open full filters, with a route back to the guide. Preserve one coherent draft when switching views.
- Signup profile setup owns the multilingual greeting and guided name/college/major flow. Those answers update the student’s own profile; cleanliness in Discovery filters roommates. Preserve existing details and photos. Unanswered personal fields stay unknown, and further personalization lives in profile → edit profile.
- Guided transitions use short fades and small spring movement. Reduced motion keeps a static greeting and fades. Keep input immediate, preserve back-navigation values, and retain entered values on save errors.
- Profiles support up to six ordered photos. The first is the cover. Photo areas have bottom dots and left/right arrows; swiping right advances and left goes back. Photo gestures never like/pass a roommate; keep roommate swipes on the rest of the card and retain action buttons. Keep headline text above the dots with separate space.
- Preserve keyboard controls, visible focus, motion pause, reduced-motion support, and honest sample labeling.
- Validate desktop, narrow/mobile, and short viewports before finishing.

## Git workflow

The owner's latest preference is small, focused commits, with an occasional larger commit for a cohesive change. Preserve intermediate design iterations, including unsuccessful positions or styles, as honestly labeled checkpoint commits. Do not wait for final approval to record an iteration; verify functional changes. Do not push unless requested. Supersedes the earlier request to wait several minutes between commits.


## Prelaunch waitlist

The owner chose an email-only waitlist ahead of UVA early decision results. Do not promise a specific day or automatically launch the full app. Preserve the center wordmark, matcha bowl, petals and sample interactions. The landing CTA opens a short email dialog. Show success only after the API confirms saving; keep entries on retry. Public builds use VITE_WAITLIST_ONLY=true; development retains /app-preview and the full routes. No domain purchase and no chatgpt.site address. Selected host: Cloudflare Pages free plan at https://matcharoomie.pages.dev. The waitlist is live; the full app is not launched.

The campus strip is shared by the waitlist and main landing page. Show a broad mix of 51 private and public universities, including UVA, Rice, Michigan and the UC campuses. Use formal institution names with their proper capitalization (an explicit exception to lowercase UI copy), use locally stored institutional marks where available, and retain a gentle constant scrolling speed as the list grows. This is a campus showcase, not a ranked list or affiliation claim.
