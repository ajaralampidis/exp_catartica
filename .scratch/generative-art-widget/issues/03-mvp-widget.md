# 03: MVP generative art widget

**What to build:** End to end: a user types Writing on the home page, picks a Canvas size, clicks Generate to render it via a placeholder ArtGenerator, and exports the result as JPG. SVG export stays hidden since the placeholder doesn't support it. The non-artistic logic (Writing validation, Canvas size resolution, export-capability listing) ships with its unit tests in this same ticket — tests and feature land together, never as a follow-up.

**Blocked by:** 01

**Status:** done

- [x] Widget renders on the home page: textarea, Canvas size picker (Square 1:1, Portrait 4:5, Story 9:16 presets, plus custom width/height), Generate button, Export JPG button
- [x] Submitting blank or whitespace-only Writing is blocked; any other Writing (any length, line breaks, emoji) is accepted
- [x] Clicking Generate renders the current Writing through the placeholder ArtGenerator onto the Canvas at the selected size
- [x] The ArtGenerator interface accepts Writing plus a set of available EntropySources (time, mouse position, viewport size) and declares an SVG-support capability flag
- [x] The placeholder ArtGenerator declares no SVG support, so the SVG export button is hidden — not shown disabled — for it
- [x] Export JPG produces a downloadable JPG matching the current Canvas content
- [x] Clicking Generate again with unchanged Writing may produce a different visual result — no caching that forces identical output
- [x] Widget-core logic (Writing validation, Canvas size resolution, export-capability listing) lives in a module with no DOM or p5.js dependency
- [x] Vitest unit tests cover Writing validation, Canvas size resolution, and export-capability listing, committed together with the feature
- [x] No unit tests assert on ArtGenerator drawing output/pixels
