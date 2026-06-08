## 📝 Description
<!-- Provide a clear and concise description of what this PR does -->


## 🔗 Related Issues
<!-- Link related issues using keywords: closes, fixes, resolves, relates to -->
<!-- Example: Closes #123, Relates to #456 -->


## ❓ Type of Change
<!-- Mark the relevant option with an "x" (e.g., [x]) -->
- [ ] 🐞 **Bug fix** — Non-breaking change that fixes an issue
- [ ] 💡 **Feature Request** — Community-suggested feature implementation
- [ ] 🔧 **Chore** — Maintenance tasks, dependency updates, CI/CD, etc.
- [ ] ✨ **Feature** — Approved/planned feature implementation
- [ ] ♻️ **Refactoring** — Code change that neither fixes a bug nor adds a feature
- [ ] 📚 **Documentation** — Changes to documentation only
- [ ] 💥 **Breaking change** — Fix or feature that would cause existing functionality to change
- [ ] 🧪 **Test** — Adding or updating tests

## 📋 Changes Made
<!-- Provide a bullet-point list of the changes made -->
- 

## 📎 Screenshots / Recordings
<!-- If applicable, add screenshots or recordings to demonstrate the changes -->
<!-- Delete this section if not applicable -->


## 🧪 How to Test
<!-- Provide steps for reviewers to test your changes -->
1. 

## ✅ Checklist
### General
- [ ] My code follows the project's coding standards and style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings or errors

### Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested my changes on multiple platforms (if applicable)

### Noderium gates
- [ ] Commit title follows **Conventional Commits**, lowercase subject (commitlint passes)
- [ ] `just test` is green (cargo + frontend + editor latency p95 < 16ms)
- [ ] `clippy -D warnings`, `fmt --check`, `lint`, and `format:check` all pass
- [ ] UI changes verified in **light and dark** (screenshots above if visual)
- [ ] **en-US and pt-BR** dictionaries kept in sync (if i18n touched)
- [ ] FSD boundaries / pure domain crates respected (no Tauri/UI leakage into core)

### Documentation
- [ ] I have updated the documentation accordingly (if applicable)
- [ ] I have updated the CHANGELOG (if applicable)

### Breaking Changes
<!-- If this PR introduces breaking changes, describe them here -->
<!-- Delete this section if not applicable -->
- [ ] I have documented the breaking changes
- [ ] I have provided a migration guide (if needed)

**Breaking changes description:** 

## 🗒️ Additional Notes
<!-- Add any additional context, notes for reviewers, or anything else -->
