# DESIGN.md

# Design System: Repository Observatory

## Core Visual Thesis
ProjectRevive is a "repository observatory": a digital archaeology workspace where dormant, valuable codebases are detected, evaluated, and brought back to life. It refuses the permanent left sidebar and generic enterprise dashboard templates in favor of a cinematic, editorial developer platform.

---

## 1. Palette & Surface Tokens
- **Background Ground**: Near-black (`#0d0b0a` / `hsl(24 15% 5%)`).
- **Elevated Surfaces**:
  - Observatory Card Canvas: `#14110f`
  - Table & Story Containers: `#120f0d`
  - Inset Control Beds: `#0a0807`
- **Typography & Text Color**:
  - Primary Headlines & Text: Warm ivory (`#faf8f5` / `hsl(40 20% 96%)`) for high readability without harsh pure white glare.
  - Secondary Telemetry Text: Muted stone (`#a49e99` / `hsl(30 10% 62%)`).
- **Semantic Color Signals**:
  - **Revival Ember Accent**: `#f97316` (Primary CTAs, glowing revival branch curves, active illuminated nodes).
  - **Cool Cyan Technical Signal**: `#22d3ee` (Forks, telemetry node signals, light maintenance badges).
  - **Amber Caution / Vitality**: `#f59e0b` (Stars, vitality bar, moderate effort score).
  - **Selective Borders**: `#2e2926` (Subtle 1px boundaries, 0px hard offset shadows).

---

## 2. Typography & Hierarchy
- **Primary Interface**: Inter / System Sans stack (14px–16px body, high scanability).
- **Editorial Major Moments**: Serif italic accent (`font-serif italic font-normal text-orange-400`) on key verbs (e.g. *"Good code shouldn't disappear."*).
- **Repository Telemetry & Code**: JetBrains Mono / SF Mono for commit hashes, star numbers, dates, tech tags, and node IDs.

---

## 3. Visual Metaphors & Composition
- **Commit Trails & Revival Branch Graphs**: Real-data animated SVG commit trees showing the trunk transitioning from dormant to an illuminated revival branch.
- **Repository Vitality Gauge**: Health score (0–100) calculated from stargazers, forks, and open issues.
- **Illuminated Contributor Nodes**: Visual representation of active maintainers and needed contributor roles.
- **Curated Revival Stories**: 3 deep editorial cards answering:
  1. What does the project do?
  2. Why is it worth reviving?
  3. What condition is it in?
  4. What kind of help is needed?
  5. What is the adoption difficulty?

---

## 4. Power-User Directory Table
- High-density custom table with faceted filtering:
  - Inline search by keyword/stack
  - Direct status toggles (`All`, `Seeking Adoption`, `Open Source`, `Freelance`)
  - Advanced popover for multi-tag tech stacks and project types
  - Removable active filter chips
  - Clickable rows opening the technical decision drawer (`ProjectDetailsDrawer`)
  - Responsive mobile cards view below 768px (`md`).
