# Roomie Match design preferences

Confirmed by the owner, October 16, 2026. Read these before changing the interface.

- Preserve the original cream, butter, apricot, peach, sakura pink, and dark-green palette. Existing CSS variables are the source of truth.
- Keep **roomiematch.** as the central landing-page focal point, in the existing editorial serif. Preserve the small doorway brand.
- Aim for minimal, cozy, playful design. Refine the existing interface instead of introducing a new brand, elaborate scenes, or generated portrait mockups.
- Use lowercase interface copy. Preserve the casing of members' supplied names, personal content, and typed values.
- Vary scale deliberately: large wordmark, medium profile cards, smaller scroll previews, quiet utility controls. Do not make every element the same size.
- Preserve the existing swipe physics and idle timings. Falling petals vary in size, delay, duration, and drift. Motion should feel varied and natural rather than synchronized.
- Page transitions are short native crossfades with a small settling movement: 130ms outgoing, 280ms incoming, 6px travel. Navigation must stay responsive and interruptible. Reduced motion removes route movement.
- Non-Discovery pages gently reveal content after loading: lists 340ms, profiles 400ms, search 220ms, with at most 5px travel. Do not add this reveal to Discovery. Refreshes must not remount interactive content.
- Swipe reaction text appears toward the gesture direction and fades in, holds briefly, and fades out over 3.3 seconds. Place it inside the card, between its center and the swipe side (35%/65% across), around the middle-to-lower part of the visible card. Vary position only slightly (never high above it), and give each gesture a noticeable randomized 7–14° tilt. Clamp its rotated bounds to the viewport. Show one reaction per swipe; the match banner handles mutual-match confirmation without restarting the reaction.
- Landing sample reactions sit just outside the stack with a small gap, never over cards or the central wordmark. Measure the actual wordmark, subtitle, button and adjacent preview separately; do not block the whole central column. When the side is crowded, use the nearest lower-side corner with only an 8px gap. Keep randomized tilt and avoid consecutive repeated phrases. Treat both demo captions as protected obstacles too; never cover “try a swipe.” If no collision-free visible position exists, omit decorative ink and retain the accessible swipe announcement.
- Discovery opens directly on a profile. Filters remain optional, nearby, and preserve saved choices. Keep swipe and scroll browsing.
- On the first Discovery visit, point gently to filters; never open setup automatically there. The first filters click opens a multilingual greeting, missing profile basics one at a time, then optional roommate cleanliness. No step count. Later clicks open full filters, with a route back to the guide.
- Signup profile setup uses the same guided name/college/major flow. Those answers update the student’s own profile; cleanliness in Discovery filters roommates. Preserve existing details and photos. Unanswered personal fields stay unknown, and further personalization lives in profile → edit profile.
- Guided transitions use short fades and small spring movement. Reduced motion keeps a static greeting and fades. Keep input immediate, preserve back-navigation values, and retain entered values on save errors.
- Preserve keyboard controls, visible focus, motion pause, reduced-motion support, and honest sample labeling.
- Validate desktop, narrow/mobile, and short viewports before finishing.

## Git workflow

The owner's latest preference is small, focused commits, with an occasional larger commit for a cohesive change. Preserve intermediate design iterations, including unsuccessful positions or styles, as honestly labeled checkpoint commits. Do not wait for final approval to record an iteration; verify functional changes. Do not push unless requested. Supersedes the earlier request to wait several minutes between commits.

