# Domain docs

Single-context layout. One `CONTEXT.md` at repo root documents the entire domain.

Architecture decisions live in `docs/adr/`. Each ADR is one markdown file, named `NNNN-kebab-case-title.md`.

## Consumer rules

- Read `CONTEXT.md` once per session to ground yourself in domain terminology and current constraints.
- Before proposing a major architectural change, check `docs/adr/` for prior decisions and their rationale.
