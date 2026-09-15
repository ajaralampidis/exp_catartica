# Generative Art Widget — Spec

Status: ready-for-agent

## Problem Statement

Attendees of Expresión Catártica write during the event, but that Writing has no way to become a shareable piece of art. There's also no app at all yet: no Astro project, nothing deployed.

## Solution

Stand up the Astro app, deploy it, and ship a single-page Widget where a user types Writing, clicks Generate to render it through an ArtGenerator onto a Canvas, and exports the result as a JPG (SVG later, for ArtGenerators that support it).

## User Stories

1. As a developer, I want an Astro project scaffolded with TypeScript (strict) and pnpm, so that the app has a consistent, typed foundation.
2. As a developer, I want the Node version pinned via `.nvmrc`, so that builds are reproducible across machines.
3. As a developer, I want the app deployed on Vercel via a hand-configured GitHub integration (not the one-click "Import Project" flow), so that I understand how the deploy pipeline works.
4. As a developer, I want the deploy to run on every push to the main branch, so that shipped tickets go live without a manual step.
5. As a user, I want the Widget on the home page, so that I don't have to navigate anywhere to use it.
6. As a user, I want a text area to type my Writing, so that I can enter what I wrote during the workshop.
7. As a user, I want to be blocked from submitting blank or whitespace-only Writing, so that I don't generate art from nothing.
8. As a user, I want to use line breaks and emoji in my Writing, so that I'm not constrained in how I express it.
9. As a user, I want no maximum length on my Writing, so that a long piece isn't cut off.
10. As a user, I want to pick a Canvas size from presets (Square 1:1, Portrait 4:5, Story 9:16), so that my export fits a specific social media format.
11. As a user, I want to enter a custom Canvas width and height, so that I can target a format not covered by the presets.
12. As a user, I want to click Generate and see my Writing rendered as art on the Canvas, so that I can preview the result before exporting.
13. As a user, I want clicking Generate again to potentially produce a different result, so that I can explore variations of the same Writing.
14. As a user, I want to export my Canvas as a JPG, so that I can post it on social media.
15. As a user, I want the SVG export option hidden when the current ArtGenerator doesn't support it, so that I'm not offered a format that would fail.
16. As a developer, I want an ArtGenerator interface that declares whether it supports SVG export, so that the app can add more ArtGenerators later without changing the Widget.
17. As a developer, I want an ArtGenerator interface that accepts Writing plus optional EntropySources (time, mouse position, viewport size), so that future ArtGenerators can use variation sources beyond Writing.
18. As a developer, I want a first, placeholder ArtGenerator (a simple, generic p5.js sketch), so that the full pipeline — Widget → Generate → Canvas → Export — is provable before real visual design work happens.
19. As a developer, I want the Widget's non-artistic logic (Writing validation, Canvas size resolution, export-capability listing) isolated in a module with no DOM or p5.js dependency, so that it's unit-testable without a browser.
20. As a developer, I want unit tests on that isolated module, so that regressions in validation or size math are caught without relying on visual judgment.

## Implementation Decisions

- **Astro scaffold**: `pnpm create astro`, TypeScript strict mode, static output. Node version pinned via `.nvmrc` to current LTS.
- **Deploy**: Vercel, connected to the GitHub repo through Vercel's git integration configured by hand (not the one-click dashboard import) — CLI-driven or manual project settings, so the steps are understood rather than automated away. Static site; no serverless functions needed yet (the future GitHub-as-database service will need them, but that's out of scope here).
- **Widget**: one vanilla TypeScript island on the home page. No UI framework.
- **Widget core module** (the seam): framework-agnostic, no DOM, no p5.js. Exposes:
  - Writing validation: rejects blank/whitespace-only input; otherwise permissive (any length, line breaks, emoji allowed).
  - Canvas size resolution: named presets (`square` 1080×1080, `portrait` 1080×1350, `story` 1080×1920) map to `{width, height}`; a custom `{width, height}` pair passes through unchanged.
  - Export-capability listing: given an ArtGenerator, returns the formats it supports — JPG always, SVG only if the ArtGenerator declares it.
- **ArtGenerator interface**: takes Writing, a resolved Canvas size, and a bag of available EntropySources (time, mouse position, viewport size) as input; draws via p5.js. Declares a capability flag for SVG support, so the widget core can discriminate SVG-capable from non-capable ArtGenerators at runtime. An ArtGenerator is free to ignore any or all EntropySources — Writing is the only required input.
- **First ArtGenerator**: a placeholder — a simple, generic p5.js sketch using Writing (and optionally an EntropySource) to prove the pipeline. Declares no SVG support.
- **Generate**: re-invokes the current ArtGenerator with a fresh read of EntropySources each click, so repeated clicks on unchanged Writing may render differently. No caching/memoization in the widget core.
- **Export**: JPG export uses p5.js's raster canvas export. SVG export machinery is not implemented in this spec — only the capability flag and the widget-core listing function that lets the UI hide the button when unsupported.
- **No persistence, no auth, no network calls**: the MVP widget is entirely client-side and static.

## Testing Decisions

- Unit test the widget core module only: Writing validation, Canvas size resolution, export-capability listing. These are pure functions with no DOM or p5.js dependency.
- Do not test ArtGenerator drawing output. Whether the art looks good is a visual judgment call, not an assertion.
- No existing test setup in the repo (greenfield) — the ticket that introduces the widget core also introduces the test runner (Vitest, framework-agnostic, works without a browser for these pure functions).
- This establishes the pattern for future "objective" logic (login, the GitHub-store service): unit-test the non-artistic parts, TDD-style; never unit-test the art itself.

## Out of Scope

- The real ArtGenerator visual design — deferred to a `/prototype` session.
- SVG export implementation itself (interface allows for it; not built here).
- BMP, GIF, MP4 export.
- Multiple ArtGenerators or an ArtGenerator selector UI.
- Login/auth.
- Post (saving a Generate result to a database) and the GitHub-as-database service.
- Live preview while typing (debounced regeneration) — this MVP is click-to-Generate only.
- Modeling "workshop" as an app concept — the app knows Users and Writing, not workshops or events.

## Further Notes

- Domain vocabulary (Writing, Widget, Canvas, ArtGenerator, EntropySource, Generate, Export, and the planned Post / GitHub-as-database service) is recorded in `CONTEXT.md` at the repo root.
- User-requested ticket sequencing: Astro setup → commit, Vercel deploy → commit, MVP widget → commit. Reflected in `/to-tickets` as three tickets with blocking edges in that order.
