
---
Task ID: 2
Agent: Super Z (main)
Task: Update multi-user comment collaboration feature per user feedback — ping-to-top with single-active-ping replacement, inline thread expansion (no separate thread page), "You" label for own comments, configurable theme (gray default), and fix mention dropdown position.

Work Log:
- Updated src/store/comments-store.ts:
  * Changed `view` type from "agencies" | "discussion" | "thread" to "agencies" | "discussion" (thread is now inline)
  * Added `expandedThreadIds: string[]` state for tracking inline-expanded parent comments
  * Added `theme: "light" | "gray" | "dark"` state with `setTheme` and `toggleTheme` actions
  * Added `toggleThreadExpanded`, `isThreadExpanded`, `collapseAllThreads` actions
  * Rewrote `pingComment`: now clears ALL other pings in the discussion (single-active-ping replacement rule) and moves the pinged top-level comment to the TOP of the comments array
  * `openThread` is now a thin wrapper around `toggleThreadExpanded` for backwards compat
- Updated src/app/globals.css:
  * Added 3 themes: `:root[data-theme="light"]`, `[data-theme="gray"]` (default), `[data-theme="dark"]`
  * Gray theme uses `--background: #F1F2F5` (soft cool gray) for reduced eye strain
  * Cards remain pure white for contrast
  * Added `.app-bg` utility for page-level backgrounds
  * Added `.pinged-glow` shadow utility for pinged comments
- Updated src/app/layout.tsx: render `<ThemeBootstrap />` and set initial `data-theme="gray"` on <html>
- Created src/components/comments/ThemeBootstrap.tsx: client component that syncs theme from store to <html data-theme> attribute
- Updated src/components/comments/MentionDropdown.tsx + MessageComposer.tsx:
  * Mention dropdown now anchors BELOW the textarea (`rect.bottom + 6`) instead of above
  * Added viewport-overflow detection: if rendering below would overflow, automatically flip above
  * Changed animation direction from `y: -4` to `y: 4`
- Updated src/components/comments/CommentCard.tsx:
  * Display name shows "You" (in primary color) when comment is from current user, plus a small "me" badge
  * Added inline thread expansion: when expanded, replies render BELOW the parent comment with a vertical connector line, in a soft muted panel
  * Reply button toggles inline composer (no longer navigates to thread page)
  * "X replies" button toggles inline thread expansion (chevron up/down icon shows state)
  * Added "Pinned to top" badge for pinged comments
  * Added `pinged-glow` shadow effect
  * Inline composer appears inside expanded thread section so users can reply right there
- Updated src/components/comments/DiscussionView.tsx:
  * New "Pinned comment" banner at top of feed above the pinged comment
  * "Discussion" divider separates pinned section from chronological section
  * Date dividers only render inside the chronological section (not above pinned)
  * Added Bell icon import for the pinned banner
- Updated src/components/comments/CommentsDrawer.tsx: removed ThreadView route (only "agencies" and "discussion" views remain; threads render inline)
- Updated src/components/comments/CandidateList.tsx:
  * Page wrapper uses `app-bg` class (picks up theme gradient)
  * Added 3-button segmented theme switcher (Sun/Monitor/Moon icons) in header
  * Default theme is "gray"

Stage Summary:
- All 8 requested changes are implemented and verified visually via agent-browser + VLM analysis:
  1. Ping-to-top: ✅ pinged comment moves to top with "Pinned comment" banner
  2. Single-active-ping replacement: ✅ verified by pinging John's comment after Sarah's — Sarah's pin was cleared
  3. Inline thread expansion: ✅ replies render below parent on same page (no ThreadView navigation)
  4. Inline reply on same page: ✅ composer appears inside expanded thread
  5. "You" label for own comments: ✅ displayed with "me" badge
  6. Configurable theme: ✅ 3 themes (light/gray/dark) via segmented toggle in header
  7. Gray background default: ✅ body bg = #F1F2F5 (verified via getComputedStyle)
  8. Mention dropdown below textarea: ✅ renders below with viewport-overflow flip
- Dev server runs cleanly, no compile errors
- ThreadView.tsx file kept for reference but no longer imported anywhere
