# Carousel Studio React Beta Roadmap

Status: foundation planning on `react-beta-foundation`. The current public `main` branch remains the production Vanilla app until a React build passes its acceptance gates.

## Direction

Build on the existing v52 Golden Master behavior, not by copying its single-file implementation into React. Keep the current GitHub Pages app intact while React development takes place on an isolated branch and preview path.

Core invariant:

`Slide Model → canonical geometry + TextLayout → RenderScene → React DOM / Canvas PNG / SVG`

React controls the interface. Carousel Core owns visual decisions. Renderers must not independently decide layout or text wrapping.

## ArtCraft-informed engineering practices

Inspired by the public FigCraft and DesignCraft project documentation, adapted to this React/TypeScript app rather than copied:
- Treat user-visible operations as explicit commands with predictable undo behavior.
- Keep UI components thin; route mutations through a shared command/state layer.
- Keep the render engine independent from the UI and use a single scene contract.
- Turn each visual bug into a deterministic regression test.
- Verify work by rendering screenshots and comparing the result with the same synthetic fixture, not by relying on type-checking alone.
- Keep a ranked gap list and update progress notes after each milestone.
- Protect production: build/test/preview on a branch, promote only after acceptance gates pass.
- Use original/licensed assets only; record provenance and avoid importing app branding/icons from other tools.

References:
- FigCraft (early alpha): https://github.com/storytold/figcraft
- FigCraft agent guide: https://github.com/storytold/figcraft/blob/main/AGENTS.md
- DesignCraft typography parity methodology: https://github.com/storytold/designcraft/blob/main/docs/typography-parity.md
- DesignCraft UI parity methodology: https://github.com/storytold/designcraft/blob/main/docs/ui-parity.md

## Current verified repository state

- `main` serves the production single-file `index.html` application and current README describes a Vanilla HTML/CSS/JS workflow.
- There is no React/Vite project in the repository root yet.
- Existing React Core/Render Engine/typography harness packages are conversation artifacts, not yet committed as a React app in this repository.
- Therefore React has not been promoted to the public GitHub Pages route.
- The new `react-beta-foundation` branch is intentionally isolated from `main`.

## Milestones

### R0 — Repository and deployment safety
- [x] Create isolated `react-beta-foundation` branch from `main`.
- [x] Record React beta roadmap.
- [ ] Keep current production route unchanged.
- [ ] Decide React preview deployment path once the app shell is committed.
- [ ] Add build, unit-test and browser-test CI before promotion.

### R1 — Reproducible React workspace
- [ ] Commit the latest React Core + RenderScene + TextLayout harness into `apps/react/` or equivalent isolated app directory.
- [ ] Pin package manager and dependencies with a lockfile.
- [ ] Add scripts for typecheck, unit tests, build and browser tests.
- [ ] Add CI workflow that installs from lockfile, runs typecheck/unit tests/build, then Playwright smoke tests.
- [ ] Store screenshot artifacts on failed visual regression runs.

### R2 — Renderer parity gate
- [ ] Create a synthetic fixture representing the reported headline case ("Agora imagina sem lesões") with exact line breaks, fonts, text box bounds, highlighted word, background and slide badge.
- [ ] Compare DOM text geometry with Canvas output at the same logical and export dimensions.
- [ ] Compare SVG output by rasterizing it in a browser and comparing to Canvas output.
- [ ] Validate retained layouts: Full bleed, image left/right/top/bottom, Editorial, Asymmetric column, Golden canon, Axial split.
- [ ] Include image crop, scale, offset, layer order, overlays, logos, signatures, cutouts and swipe hint as later fixtures.
- [ ] Establish baseline screenshot artifacts before claiming parity.
- Acceptance: same fixture produces equivalent line breaks, baseline positions, highlight geometry and image framing across editor, PNG and SVG for supported features.

### R3 — Core editing workflow
- [ ] Real image upload/drop and asset lifecycle.
- [ ] Text box selection and edit in place.
- [ ] Drag/resize with coordinate conversion tied to the canonical geometry.
- [ ] Layer visibility/order editing.
- [ ] Safe zones visible in editor only and absent from exports.
- [ ] Undo/redo with deterministic commands.
- [ ] Autosave and project JSON import/export.
- Acceptance: create, edit, undo, redo, reload, export a multi-slide project without losing state.

### R4 — UX polish and usability
- [ ] Desktop editor: stage dominates; left slide rail; contextual right inspector.
- [ ] Fast Cook/Slow Cook modes change complexity, not project content.
- [ ] Make export status and preflight issues visible without blocking safe export.
- [ ] Provide progress, empty, loading, error and success states for file operations.
- [ ] Keep primary actions within comfortable click/touch targets.
- [ ] Mobile editor gets a deliberate compact inspector/drawer, not a squeezed desktop layout.
- [ ] Keyboard support for undo/redo, delete, escape, duplicate where implemented, visible focus states and accessible labels.
- Acceptance: critical create/edit/export workflow works at desktop and narrow mobile viewport widths.

### R5 — Private beta readiness
- [ ] Publicly accessible preview is separated from production.
- [ ] No false "saved to cloud" claims: accurately label local persistence until backend exists.
- [ ] Export quality gate is green on supported features.
- [ ] Error handling for missing/invalid images, font unavailable, oversized exports and save failures.
- [ ] Privacy note: uploaded photos/projects stay in browser until an explicitly configured backend is introduced.
- [ ] Feedback link and a minimal issue template.
- [ ] Smoke test from a clean browser profile.
- Acceptance: a small group can complete first export, report bugs and return to a saved project.

### R6 — SaaS backend and paid launch (after product workflow is stable)
- [ ] Auth and private cloud projects.
- [ ] Storage, row-level access controls and project migrations.
- [ ] Usage limits and product analytics with clear privacy disclosure.
- [ ] Billing, subscription management and cancellation.
- [ ] Production monitoring and support workflow.
- Acceptance: security, persistence, billing and cancellation verified before charging users.

## Ranked gaps (next work first)

1. Make the React artifacts a reproducible app in the repo, including lockfile and CI.
2. Build the typography fixture and screenshot comparison, especially the line-break regression.
3. Verify image crop/offset/scale geometry between editor, PNG and SVG.
4. Implement actual text/image selection and drag/resize commands.
5. Run desktop and mobile smoke tests and create a private preview.
6. Only after the above: persistence backend, onboarding, auth and billing.

## Non-negotiable quality rules

- Never deploy React to the current production root before the parity gate passes.
- Never claim Vitest/Playwright/build passed unless CI actually ran and passed.
- Keep v52 and production HTML as read-only behavioral references.
- Add a regression test for each export mismatch found.
- Do not pull Grid Motifs back in; retained grid-inspired layouts remain the three structures already approved.
- All material roadmap and architecture changes must also be recorded in the official Notion page.
