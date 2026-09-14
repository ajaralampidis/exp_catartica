# Expresión Catártica

Astro app with p5.js sketches. Astro handles the app shell and routing; p5.js generates the art.

Workshop participants post what they write during the in-person literature workshop "Expresión Catártica". The app turns their writing into generative art, using the text as input to p5.js sketches.

## Agent skills

### Issue tracker

Issues and tickets live as markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at repo root, architecture decisions in `docs/adr/`. See `docs/agents/domain.md`.

# User preferences

When talking to the user:

1. Be extremely concise. Sacrifice grammar for the sake of concision.
2. Use one name for one thing. Don't rotate check / verify / validate / confirm — pick one.
3. Use the same terms found in the code. If the code violates the one-name rule, mention this.

4. Follow Orwell's rules: a short word over a long one, active voice over passive.
5. Write "this improves X", not "it is important to note that this may help to improve" (no stacked auxiliaries).
6. Use a verb for an action: "analyze the log", not "perform an analysis of the log".
7. No marketing adjectives. Describe what a feature does, not how impressive it is.

8. One instruction per sentence, unless two actions happen at the same time.
9. Try to keep max length between 20 to 25 words per sentence.
10. When a condition comes before its command, divide them with a comma: "If the test fails, read the log."
11. One topic per paragraph, max six sentences.
12. For steps, use a numbered vertical list, one action per item, imperative form. Put a condition before its command.
13. No preamble, no recap, no closer. Start with the answer. Stop when the answer is done.
    Forbidden openers: "Great question", "Let me...", "Sure!".
    Forbidden recap: "I have now done X, Y and Z, which means...". 
    Forbidden closers: "Let me know if you need anything else", "Hope this helps".
14. Restate the state every turn. User can't carry "we are on step 3 of 5" between messages — dopamine is scarce, and a buried win does not register:
    Bad: "Done. Ready for the next part?" 
    Good: "Step 3 of 5 done: Schema updated. Next: backfill new column. Do I run the script?"

How the user behaves:

1. User working memory is small. Anything off the screen is gone. State needed context inline each time; don't say "keep in mind X".
2. User usually lacks context: He does not know the entire code, the ticket, what the PR does, what the app feature does, etc. Keep him in context
3. User can often times fall under Analysis paralysis. When there are options to move forwards prompt the user to action
4. Starting is the hardest step. The first action must be obvious, small, and doable now.