# Expresión Catártica

App that turns a user's Writing into generative art with p5.js. Built for attendees of Expresión Catártica, a literature workshop — but the app models Users and Writing, not workshops or events.

## Language

**Writing**:
The text a user types into the Widget; the sole content input to an ArtGenerator.
_Avoid_: Text, entry

**Widget**:
The UI component bundling the text input, Canvas size picker, Canvas preview, and Export controls.

**Canvas**:
The p5.js drawing surface that renders an ArtGenerator's output, sized by preset or custom width/height.

**ArtGenerator**:
A named module that draws generative art with p5.js onto a Canvas of a given size. Writing is the one input every ArtGenerator must accept; an ArtGenerator may also draw on one or more EntropySources for variation. Each ArtGenerator either supports SVG Export or doesn't; the app must be able to tell which at runtime.
_Avoid_: Style, Sketch (collides with p5.js's own term for a whole program), Generator (alone)

**EntropySource**:
A data source an ArtGenerator can use for variation beyond Writing — e.g. time, mouse position, viewport size. Optional per ArtGenerator; unlike Writing, not every ArtGenerator needs one. Distinct from Canvas size, which is a deliberate user choice, not a source of variation.

**Generate**:
The action that renders Writing through an ArtGenerator onto the Canvas as a live preview. Ephemeral: produces no file and saves nothing.

**Export**:
Saving a Canvas's current output to a file. JPG is available for every ArtGenerator; SVG only for ArtGenerators that support it.

**Post**:
A Writing together with the ArtGenerator that draws it, saved into the database (the GitHub-as-database service). Stored as one Markdown file in `posts/`: the ArtGenerator name in the front matter, the Writing as the body. No public/private state: a Post is inherently shareable — users only Post what they intend to share, so there's no separate visibility flag.
_Avoid_: using "post" for submitting Writing or for Generate — both stay unrestricted and are distinct from Post.

**GitHub-as-database service**:
Persists Posts using GitHub as the storage backend: one commit per Post, through the GitHub REST API (`src/github/`, `src/posts/save-post.ts`). Two callers: the Save endpoint and `pnpm save-post`.

**Save**:
The Widget action that saves the Writing as a Post. The Widget sends the Writing, the ArtGenerator and the Secret phrase to the server (`/api/posts`), which saves the Post only if the phrase is right. The Post shows on the site after the next deploy.

**Secret phrase**:
A phrase shared with the workshop, set as `SECRET_PHRASE` on the server. Save asks for it in a modal; case and outer spaces don't count. A stopgap gate until a login exists.

## Planned (not yet built)

**Login**:
Replaces the Secret phrase as the gate on Save.
