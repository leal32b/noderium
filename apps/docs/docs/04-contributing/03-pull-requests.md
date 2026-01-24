# Pull Requests

This guide covers everything you need to know about submitting pull requests to Noderium.

## Before You Start

1. **Find or create an issue** — PRs should address a tracked issue
2. **Discuss first** — For large changes, get feedback before coding
3. **Check the roadmap** — Ensure your work aligns with project direction
4. **Read the codebase** — Understand existing patterns and conventions

## Creating a Pull Request

### Step 1: Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/noderium.git
cd noderium
git remote add upstream https://github.com/leal32b/noderium.git
```

### Step 2: Create a Branch

Use descriptive branch names following this convention:

```bash
# Format: <type>/<short-description>

git checkout -b feat/graph-view
git checkout -b fix/parser-crash
git checkout -b refactor/api-layer
git checkout -b docs/contributing-guide
git checkout -b chore/update-deps
```

### Step 3: Make Your Changes

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev:app

# Make your changes...
```

### Step 4: Commit Your Changes

We use **Conventional Commits**. See the [Commit Convention](#commit-convention) section below.

```bash
git add .
git commit -m "feat(graph): add bidirectional linking support"
```

### Step 5: Push and Open PR

```bash
git push origin feat/graph-view
```

Then open a PR on GitHub using our template.

---

## PR Template

When you open a PR, you'll see our template with the following sections:

### Description

Provide a clear and concise description of what your PR does.

```markdown
## Description
This PR adds bidirectional linking support to the graph view,
allowing users to see both incoming and outgoing links for any note.
```

### Related Issues

Link issues using keywords that auto-close them when merged:

```markdown
## Related Issues
Closes #123
Fixes #456
Relates to #789
```

| Keyword | Effect |
|---------|--------|
| `Closes #123` | Closes issue when PR merges |
| `Fixes #123` | Closes issue when PR merges |
| `Resolves #123` | Closes issue when PR merges |
| `Relates to #123` | Links without closing |

### Type of Change

Select the appropriate type(s):

- 🐞 **Bug fix** — Non-breaking change that fixes an issue
- 💡 **Feature Request** — Community-suggested feature implementation
- 🔧 **Chore** — Maintenance tasks, dependency updates, CI/CD, etc.
- ✨ **Feature** — Approved/planned feature implementation
- ♻️ **Refactoring** — Code change that neither fixes a bug nor adds a feature
- 📚 **Documentation** — Changes to documentation only
- 💥 **Breaking change** — Fix or feature that would cause existing functionality to change
- 🧪 **Test** — Adding or updating tests

### Changes Made

List the specific changes:

```markdown
## Changes Made
- Added `BiDirectionalLink` component
- Updated `GraphView` to render incoming links
- Added tests for link resolution
- Updated documentation
```

### How to Test

Provide clear testing steps:

```markdown
## How to Test
1. Create two notes: "Note A" and "Note B"
2. In Note A, add a link to Note B: `[[Note B]]`
3. Open the graph view
4. Click on Note B
5. Verify that Note A appears as an incoming link
```

### Checklist

Complete the checklist before requesting review:

#### General
- [ ] Code follows project's coding standards
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No new warnings or errors

#### Testing
- [ ] Tests added for new functionality
- [ ] All tests pass locally
- [ ] Tested on multiple platforms (if applicable)

#### Documentation
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if applicable)

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(editor): add vim mode support` |
| `fix` | Bug fix | `fix(parser): resolve markdown heading crash` |
| `perf` | Performance improvement | `perf(search): optimize full-text indexing` |
| `refactor` | Code refactoring | `refactor(api): simplify error handling` |
| `docs` | Documentation only | `docs(readme): update installation steps` |
| `test` | Adding/updating tests | `test(graph): add link resolution tests` |
| `chore` | Maintenance tasks | `chore(deps): upgrade vitest to v2.0` |
| `style` | Code style (formatting) | `style: fix indentation in utils` |
| `ci` | CI/CD changes | `ci: add macOS build to pipeline` |
| `build` | Build system changes | `build: update Tauri config` |

### Scopes

Common scopes in Noderium:

| Scope | Area |
|-------|------|
| `core` | Rust backend |
| `ui` | SolidJS frontend |
| `editor` | Note editor |
| `graph` | Graph view |
| `search` | Search functionality |
| `db` | Database layer |
| `parser` | Markdown parser |
| `api` | Tauri commands |
| `docs` | Documentation |
| `deps` | Dependencies |

### Examples

```bash
# Feature with scope
feat(graph): add cluster visualization

# Bug fix
fix(editor): resolve cursor jump on save

# Breaking change (note the !)
feat(api)!: change vault configuration format

# With body and footer
feat(search): implement fuzzy matching

Add fuzzy search support using the fuse.js library.
This improves search results for partial matches.

Closes #234
```

---

## Review Process

### What We Look For

| Aspect | What We Check |
|--------|---------------|
| **Functionality** | Does it work as intended? |
| **Code Quality** | Is it clean, readable, maintainable? |
| **Performance** | Any performance implications? |
| **Tests** | Are there adequate tests? |
| **Documentation** | Is it properly documented? |
| **Breaking Changes** | Are they documented and justified? |

### Review Timeline

- **Initial response**: Within 48-72 hours
- **Full review**: Depends on PR complexity
- **Simple fixes**: Usually same day
- **Large features**: May take longer

### Responding to Feedback

1. **Address all comments** — Resolve or discuss each point
2. **Push fixes as new commits** — Don't force-push during review
3. **Re-request review** — After addressing feedback
4. **Be patient** — Maintainers are often volunteers

---

## PR Size Guidelines

| Size | Lines Changed | Review Time |
|------|---------------|-------------|
| **XS** | < 50 | Quick |
| **S** | 50-200 | Same day |
| **M** | 200-500 | 1-2 days |
| **L** | 500-1000 | Several days |
| **XL** | > 1000 | Consider splitting |

### Tips for Smaller PRs

- Split large features into incremental PRs
- Separate refactoring from feature changes
- Extract unrelated fixes into separate PRs
- Use feature flags for incomplete features

---

## After Merge

1. **Delete your branch** — Keep the repository clean
2. **Update your fork** — Sync with upstream
3. **Celebrate** — You're now a Noderium contributor! 🎉

```bash
# Update your fork
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

---

## Common Issues

### PR Conflicts

```bash
# Update your branch with latest main
git fetch upstream
git rebase upstream/main
# Resolve conflicts, then:
git push --force-with-lease origin your-branch
```

### CI Failures

1. Check the CI logs for specific errors
2. Run tests locally: `pnpm turbo run test lint`
3. Fix issues and push new commits

### Stale PRs

PRs with no activity for 30 days may be closed. To reopen:
1. Rebase on latest main
2. Address any outdated feedback
3. Comment that you're ready for review

---

## Need Help?

- **Questions about your PR**: Comment on the PR
- **General questions**: [GitHub Discussions](https://github.com/leal32b/noderium/discussions)
- **Stuck on implementation**: Ask in the related issue
