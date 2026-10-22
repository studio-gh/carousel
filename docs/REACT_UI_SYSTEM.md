# React editor UI system

This is the initial design direction for React beta. It is inspired by general interaction patterns documented in FigCraft/DesignCraft, not by copying their code or trademarked assets.

## Product character

**Editorial tool, not generic SaaS dashboard.**
- Dark-neutral workspace chrome with high-contrast content stage.
- Warm accent color reserved for primary action, selection and current state.
- Neutral surfaces, strong type hierarchy, generous spacing.
- The carousel preview is the hero of the workspace.
- Original icons or a permissively licensed icon set only. No copied third-party app icons.

## Desktop composition

- Header: project name, save state, undo/redo, preview, export.
- Left rail: slide thumbnails, add/duplicate/reorder/delete.
- Center: stage with slide, zoom controls and optional rulers/safe zones.
- Right contextual inspector: content, image, typography, layers, canvas/settings.
- Preflight appears as a concise list of issues connected to affected slide/layer, with fixes where safe.
- Export menu surfaces format, resolution, current slide/all slides, then explicit progress/success/failure.

## Mobile composition

- Keep slide preview central and readable.
- Use an inspector drawer/sheet with tabs; do not compress every desktop control into one narrow column.
- Sticky bottom action row: Slides, Edit, Preview, Export.
- All drag interactions must have non-drag alternatives (position inputs, alignment actions, layer ordering controls).
- Touch targets should be comfortable and not overlap the content selection handles.

## Component inventory

- AppShell
- ProjectHeader
- SaveStatus
- SlideRail / SlideThumbnail
- StageViewport
- SlideCanvas
- SelectionOverlay / ResizeHandles
- SafeZoneOverlay (editor only)
- Inspector
- TypographyPanel
- ImagePanel
- LayerPanel
- PreflightPanel
- ExportDialog / ExportProgress
- Toast / InlineError / EmptyState / LoadingState

## Interaction contract

- Every edit goes through a named command.
- A command declares whether it participates in undo history.
- Continuous pointer movement updates a transient preview; pointer-up commits one command and one undo step.
- Escape cancels a transient edit.
- Delete removes the selected object only when canvas focus and selection make that intent clear.
- Undo/redo is shared by keyboard and UI controls.
- Hidden layers do not render in any output renderer.
- Safe-zone and selection overlays never render to PNG/SVG.
- Fast Cook/Slow Cook changes the visible complexity of controls, never the underlying saved project content.

## Accessibility and reliability

- Every control has an accessible name.
- Keyboard focus is visible.
- Icon-only controls have tooltips/labels.
- Loading, empty, saving, saved, unsaved, export progress, export success and export failure states are explicit.
- Do not claim cloud sync while only local persistence is available.
- No destructive delete without a reliable undo step or confirmation for project-level deletion.

## Visual QA gates

Before a visual milestone is accepted:
1. Capture the same fixture in editor, PNG and SVG.
2. Compare text bounds, line breaks, image crop, overlays, layer order and output dimensions.
3. Capture wide desktop and narrow mobile screenshots.
4. Verify selection handles/safe zones are absent from exports.
5. Attach screenshots to CI on failure where feasible.
