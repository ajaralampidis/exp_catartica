# Expresión Catártica

Astro + p5.js playground for generative art and creative code.

Built for the in-person literature workshop "Expresión Catártica". Participants post what they write during the workshop, and the app turns their words into generative art with p5.js sketches.

## Fact of the day

The word "catartica" traces back to "catharsis" — a release, a clearing out.
Fitting for a workshop where writing becomes art.

## Deploy

Live: https://exp-catartica.vercel.app

Vercel project `exp-catartica`, linked to GitHub `ajaralampidis/exp_catartica`. Every push to `main` deploys to production.

Settings (Vercel defaults, no overrides):

- Framework preset: Astro
- Build command: `astro build` (`pnpm build`)
- Output directory: default (`dist`)
- Install command: `pnpm install`
- Root directory: `.`
- Node.js: 24.x (matches `.nvmrc`)

To repeat:

1. In the Vercel dashboard, create a new project. Pick this GitHub repo.
2. Set the framework preset to Astro. Keep the default commands.
3. Set Node.js to 24.x.
4. Set the production branch to `main`.
5. Deploy. Push to `main` to confirm a new deploy starts.

## Posts

Each Post is a Markdown file in `posts/`. The page `/posts` lists them, and each one opens in full screen.

To publish from the site: write, type the secret phrase, click Publish. The server (`/api/posts`) commits the Post to `main`.

To save a Post to GitHub from your machine:

1. Create a fine-grained token on the repo, with "Contents: Read and write".
2. Copy `.env.example` to `.env` and fill in the token and the secret phrase.
3. Run `pnpm save-post "your writing"`.

Both ways make one commit. Every push to `main` deploys, so the new Post shows after the deploy.

`pnpm dev` loads `.env`, so Publish on localhost commits to the real repo.

The site runs `/api/posts` as a Vercel function (`@astrojs/vercel`). Set these Production env vars in Vercel: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `SECRET_PHRASE`.

## Status

🚧 Just getting started.
