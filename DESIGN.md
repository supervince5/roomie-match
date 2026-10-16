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
- Swipe reaction text appears toward the gesture direction and fades in, holds briefly, and fades out over 3.3 seconds. Clamp it to the viewport; when a side gutter is too narrow, place it above that edge.
- Discovery opens directly on a profile. Filters remain optional, nearby, and preserve saved choices. Keep swipe and scroll browsing.
- Preserve keyboard controls, visible focus, motion pause, reduced-motion support, and honest sample labeling.
- Validate desktop, narrow/mobile, and short viewports before finishing.

## Git workflow

The owner's latest preference is small, focused commits, with an occasional larger commit for a cohesive change. Commit completed, checked work. Do not push unless requested. Supersedes the earlier request to wait several minutes between commits.

