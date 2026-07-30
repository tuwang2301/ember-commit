# Design System: GitHub Streak Companion (simplified)

> Scope confirmed: single overall streak, no multi-track, no public page. Core purpose is reminder + rescue-commit to keep the streak alive when too busy to code. This replaces the earlier "Learning-in-Public / Track Grid" draft entirely.

## 0. Design plan

**Signature element:** the contribution grid itself — deliberately **not** reinvented. Earlier drafts tried a custom "Chain" motif and later a multi-color "Track Grid," both rejected because familiarity beats novelty here: this app's whole point is being a companion to something the user (and anyone glancing at it) already reads instantly. The grid should look and behave like GitHub's own contribution graph, not like a new visual language.

**What's actually custom:** everything *around* the grid — the reminder/status layer, the rescue-log flow, the notification tone — since none of that exists in GitHub itself. That's where this app earns its place.

---

## 1. Color

| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#0C0F14` | App background |
| `--surface` | `#171B23` | Cards, panels, modals |
| `--surface-raised` | `#1F242E` | Hover/elevated surface |
| `--line` | `#262B36` | Borders, dividers |
| `--text-primary` | `#E8EAED` | Primary text |
| `--text-muted` | `#8B92A3` | Secondary text, captions |

**Grid scale** — matches GitHub's own dark-mode contribution colors (approximate; verify against Primer if pixel-perfect matching matters), used only for the grid cells, nowhere else:

| Level | Hex | Meaning |
|---|---|---|
| L0 (empty) | `#161B22` | No contribution |
| L1 | `#0E4429` | Low activity |
| L2 | `#006D32` | Moderate |
| L3 | `#26A641` | High |
| L4 | `#39D353` | Highest (relative to the user's own busiest day — same quartile logic GitHub uses, not a fixed count) |

**Status colors** (used only for the reminder/status badge, never on the grid):

| Token | Hex | Usage |
|---|---|---|
| `--status-safe` | `#5FD1B0` | Already contributed today |
| `--status-at-risk` | `#F2A93B` | No contribution yet, before last reminder |
| `--status-critical` | `#EF5B5B` | No contribution yet, at/after last reminder |

```css
:root {
  --ink: #0C0F14;
  --surface: #171B23;
  --surface-raised: #1F242E;
  --line: #262B36;
  --text-primary: #E8EAED;
  --text-muted: #8B92A3;
  --grid-l0: #161B22;
  --grid-l1: #0E4429;
  --grid-l2: #006D32;
  --grid-l3: #26A641;
  --grid-l4: #39D353;
  --status-safe: #5FD1B0;
  --status-at-risk: #F2A93B;
  --status-critical: #EF5B5B;
}
```

## 2. Typography

- **Display / metrics face:** `IBM Plex Mono` — streak number, dates, any "readout" data. Weight 500-600 for display sizes.
- **Body face:** `Inter` — all UI copy, labels, buttons, body text.

| Role | Font | Size | Weight |
|---|---|---|---|
| Hero metric (streak count) | IBM Plex Mono | 56px | 600 |
| Section heading | Inter | 22px | 600 |
| Card title | Inter | 16px | 600 |
| Body | Inter | 14px | 400 |
| Caption/meta | Inter | 12px | 400 |
| Grid axis labels (month/day) | IBM Plex Mono | 11px | 500 |

## 3. Layout

- Base spacing unit: 4px, multiples only (8, 12, 16, 24, 32, 48).
- Radius: `6px` for cards/inputs, `999px` (pill) for the status badge and buttons.
- No shadows — separation via `--line` borders and background contrast only.
- No decorative icon set. The one place color/shape carries meaning is the grid and the status badge dot.

## 4. The Grid (unchanged from GitHub's own pattern)

- One column per week, one row per weekday, standard GitHub layout
- Cell fill = `--grid-l0` through `--grid-l4` based on that day's contribution count, scaled relative to the user's own busiest day in the visible range (not a fixed threshold — matches how GitHub itself computes it)
- Hovering/tapping a cell shows the exact count for that day
- This is a read-only mirror of the user's real GitHub contributions (pulled via GraphQL), not a separate data source — it should never disagree with what's on github.com

## 5. Status badge (the actual custom element)

- Pill shape, `--surface-raised` background, colored dot + label: `● Safe`, `● At Risk`, `● Critical`
- Sits above the grid as the one new piece of information GitHub itself doesn't surface: "will today stay green, and how urgent is it right now"
- Never fill the whole badge with the status color — keep it quiet except for the dot, consistent with the grid being the visual focus, not the badge

## 6. Component rules

- **Buttons:** pill-shaped, solid `--status-critical`-adjacent accent only for the rescue action ("Save streak"); outline style (`--line` border, transparent bg) for everything else. No gradients.
- **Cards:** `--surface` background, 1px `--line` border, 6px radius, no shadow.
- **Rescue log input:** `--surface-raised` background, `--line` border, solid `--line`→accent border on focus (crisp, no glow ring).

## 7. Motion

- One moment only: when a rescue log commits successfully, today's grid cell fills from `--grid-l0` to its earned level (150-200ms ease-out) — a small, honest confirmation, not a celebration animation.
- No ambient motion, no particle/confetti effects.

## 8. Voice (copy)

- Plain, active verbs: "Save streak," not "Submit."
- Status copy states what's true: "No contribution yet today," not "Contribution count is zero."
- Reminder urgency must be factual ("Streak ends in 2 hours" is fine because it's true) — never a fabricated stat.

## 9. Anti-pattern checklist

Reject any generated UI that includes:
- [ ] A custom reinvention of the grid (chain links, dots-on-a-rail, or anything else standing in for the familiar cell grid)
- [ ] A centered hero with icon → headline → subheadline → CTA (generic AI landing-page template)
- [ ] A 3-column feature grid with icon + title + description
- [ ] Decorative icons from a default set (Lucide/Heroicons) anywhere outside the status dot
- [ ] `rounded-xl`/`rounded-2xl` as default corner radius
- [ ] Drop shadows on cards
- [ ] Gradient-filled buttons or gradient text
- [ ] A grid that doesn't match GitHub's real per-day counts (this must always mirror the real API data)