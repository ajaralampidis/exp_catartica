# 02: Vercel deploy

**What to build:** The Astro build deployed and reachable on a public Vercel URL, redeploying automatically on every push to `main`, configured by hand rather than through Vercel's one-click GitHub import — the developer wants to understand the pipeline, not just click through it.

**Blocked by:** 01

**Status:** done

- [x] The Vercel project is linked to this GitHub repo via manually configured settings (build command, output directory), not the dashboard's automatic import wizard
- [x] A push to `main` triggers a new deploy without manual intervention
- [x] The deployed URL serves the same home page `pnpm build` produces locally
- [x] The steps taken are written down (README or a comment on this ticket) so they're understandable and repeatable, not just clicked through

Note: linking a GitHub repo to a Vercel account requires an OAuth click only a human can make. If this blocks an unattended agent, hand the account-linking step to `/wizard` and let this ticket cover the rest (build settings, deploy hook verification, writing down the steps).
