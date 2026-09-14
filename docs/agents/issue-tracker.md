# Issue tracker

Issues and work live as markdown files under `.scratch/<feature>/` in this repo.

To create an issue:
```
mkdir -p .scratch/my-feature
cat > .scratch/my-feature/issue.md << 'EOF'
# Issue title

Issue description and details.
EOF
```

To reference an issue from a PR or commit, mention `.scratch/<feature>/issue.md`.
