<!-- Keep PRs small and atomic — one logical change. -->

## What & why

<!-- What does this change do, and why? Link issues/ADRs (e.g. ADR-005). -->

## Checklist

- [ ] Conventional Commit title, lowercase subject (e.g. `feat(store): …`)
- [ ] Tests cover the behavior change; `just test` is green
- [ ] `clippy -D warnings`, `fmt --check`, `lint`, `format:check` pass
- [ ] UI changes verified in **light and dark** (screenshot if visual)
- [ ] en-US and pt-BR dictionaries kept in sync (if i18n touched)
- [ ] Docs updated (`docs/`) if behavior or architecture changed
