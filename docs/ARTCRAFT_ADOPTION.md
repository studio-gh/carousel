# Selective adoption of ArtCraft practices

Date: 2026-10-21

## Decision

Use FigCraft and DesignCraft as references for workflow and quality methods, not as runtime dependencies. Carousel Studio remains React + TypeScript + Vite on the new branch; do not port the apps' Rust/egui architecture.

## Practices adopted

1. **Command-driven interactions.** UI events dispatch named commands. Continuous gestures use preview and commit so a drag becomes one undo step.
2. **Thin UI.** React panels read the project model and dispatch commands; rendering and project mutations remain in Carousel Core.
3. **Explicit layers.** Keep clear dependency layers: project/slide model → commands/history → geometry/TextLayout → RenderScene → DOM/Canvas/SVG.
4. **Visual parity as a measurable gate.** Fixture screenshots and exported images are evidence. Unit tests alone do not prove editor/export fidelity.
5. **Typography oracle.** Record line break positions, text box dimensions, font identity/weight, text baseline and highlight bounds for the regression headline. Compare editor DOM, PNG and SVG-derived raster.
6. **Ranked gap list.** Work on the highest user-impact blocker first, update roadmap and progress log after changes.
7. **Inspect output, do not assume success.** Failed visual tests preserve editor/export screenshots and diff images as CI artifacts.
8. **Production safety.** Maintain the legacy public app on main; React lives in its own branch and preview until acceptance.
9. **Asset provenance.** Only original or permissively licensed assets; never borrow another product's logos, fonts, illustrations or icons.

## UI direction adapted for Carousel Studio

- Use a canvas-first dark editorial workspace with neutral panels and one warm accent for primary action and selection.
- Keep slide rail, stage and contextual inspector as the desktop hierarchy.
- On mobile, use a slide rail/drawer plus a contextual inspector sheet and sticky create/export actions, not a compressed desktop panel.
- Selection/safe zones are editor overlays only and must never leak into output.
- Provide non-drag alternatives for moving/resizing elements (position fields and alignment controls).
- Visible save state, export progress, actionable preflight feedback and explicit error states are required.

## Explicit non-adoption

- No Rust rewrite.
- No new runtime dependency on FigCraft or DesignCraft.
- No copied product UI assets.
- No accounts/cloud/collaboration/billing until core create-edit-export persistence and parity are reliable.
- No promotion of React to production based only on a pretty screenshot.

## Current state

These practices are translated into docs/REACT_BETA_ROADMAP.md, docs/REACT_UI_SYSTEM.md, and the issue tracker. This document does not mean the React app is already committed or that CI is passing.
