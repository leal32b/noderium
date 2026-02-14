# Labels

Labels help organize issues and pull requests, making it easier to filter, prioritize, and track work. This page documents all labels used in the Noderium repository.

## Label Categories

We organize labels into categories using prefixes:

| Prefix | Purpose |
|--------|---------|
| `type:` | What kind of issue/PR is this? |
| `status:` | Where is this in the workflow? |
| `priority:` | How urgent is this? |
| `scope:` | What part of the project? |
| (no prefix) | Special labels |

---

## Type Labels

These indicate the nature of the issue or PR.

| Label | Color | Description |
|-------|-------|-------------|
| `type: bug` | 🔴 `#d73a4a` | Something isn't working |
| `type: feature-request` | 🔵 `#1d76db` | Community-suggested feature or enhancement |
| `type: feature` | 🔵 `#a2eeef` | Approved feature for implementation |
| `type: chore` | ⚫ `#666666` | Maintenance and housekeeping |
| `type: spike` | 🟡 `#fbca04` | Research or investigation task |
| `type: refactoring` | 🟣 `#7057ff` | Code improvement without changing behavior |
| `type: documentation` | 🔵 `#0075ca` | Documentation improvements |

### When to Use

```
Bug found              → type: bug
New capability idea    → type: feature-request (community)
Approved feature       → type: feature (maintainers)
Dependency update      → type: chore
Need to research       → type: spike
Code cleanup           → type: refactoring
Docs update            → type: documentation
```

---

## Status Labels

These track where an issue is in its lifecycle.

| Label | Color | Description |
|-------|-------|-------------|
| `status: triage` | 🩷 `#e99695` | Needs initial review and prioritization |
| `status: accepted` | 🟢 `#0e8a16` | Approved and ready for implementation |
| `status: in progress` | 🔵 `#1d76db` | Currently being worked on |
| `status: blocked` | 🔴 `#b60205` | Blocked by external dependency |
| `status: needs info` | 🩷 `#d876e3` | Needs more information from reporter |

### Status Flow

```
┌─────────────────┐
│ status: triage  │ ← Issue created (automatic)
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│status: accepted │ or  │status: needs info│
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │◄──────────────────────┘
         ▼
┌───────────────────┐
│status: in progress│ ← Someone is working on it
└────────┬──────────┘
         │
         ▼
    [Issue Closed]
```

---

## Priority Labels

These indicate urgency and help with planning.

| Label | Color | Description | Response Time |
|-------|-------|-------------|---------------|
| `priority: critical` | 🔴 `#b60205` | Must be fixed immediately | ASAP |
| `priority: high` | 🟠 `#d93f0b` | Should be addressed soon | This sprint |
| `priority: medium` | 🟡 `#fbca04` | Normal priority | Next sprint |
| `priority: low` | 🟢 `#0e8a16` | Nice to have | Backlog |

### Priority Guidelines

| Priority | Use When |
|----------|----------|
| **Critical** | Security vulnerabilities, data loss, complete feature failure |
| **High** | Major functionality broken, affects many users |
| **Medium** | Important but not urgent, workarounds exist |
| **Low** | Minor improvements, cosmetic issues |

---

## Scope Labels

These identify which part of the project is affected.

| Label | Color | Description |
|-------|-------|-------------|
| `scope: app` | 🩵 `#c5def5` | Main Tauri application |
| `scope: docs` | 🩵 `#bfdadc` | Documentation site |
| `scope: ci/cd` | 🩵 `#fef2c0` | CI/CD and workflows |

### Adding New Scopes

As the project grows, we may add more scope labels:

```
scope: core      → Rust backend
scope: ui        → SolidJS frontend
scope: editor    → Note editor
scope: graph     → Graph visualization
scope: search    → Search functionality
```

---

## Special Labels

These don't follow the prefix convention but serve important purposes.

| Label | Color | Description |
|-------|-------|-------------|
| `good first issue` | 🟣 `#7057ff` | Good for newcomers |
| `help wanted` | 🟢 `#008672` | Extra attention is needed |
| `breaking change` | 🔴 `#b60205` | Introduces breaking changes |
| `duplicate` | ⚪ `#cfd3d7` | This issue already exists |
| `wontfix` | ⬜ `#ffffff` | This will not be worked on |

### Good First Issue

Issues labeled `good first issue` are ideal for new contributors:

- Well-defined scope
- Clear acceptance criteria
- Doesn't require deep codebase knowledge
- Maintainer available to help

### Help Wanted

Issues labeled `help wanted` indicate:

- We'd love community help
- May be more complex
- Could be a good learning opportunity
- Multiple approaches possible

---

## Label Combinations

Common label combinations and what they mean:

### New Bug Report
```
type: bug
status: triage
```

### Accepted Feature Ready to Work
```
type: feature
status: accepted
priority: high
scope: app
```

### Beginner-Friendly Task
```
type: documentation
status: accepted
priority: low
good first issue
```

### Blocked Critical Bug
```
type: bug
status: blocked
priority: critical
scope: core
```

---

## For Maintainers

### Triaging New Issues

1. **Add type label** — Already set by template
2. **Assess priority** — Add priority label
3. **Identify scope** — Add scope label
4. **Update status** — Change from `triage` to `accepted` or `needs info`
5. **Consider special labels** — `good first issue`, `help wanted`

### Label Maintenance

- Keep labels consistent
- Remove unused labels periodically
- Document new labels in this guide
- Use clear, descriptive names

---

## Filtering Issues

Use GitHub's filter syntax to find specific issues:

```
# All bugs
label:"type: bug"

# High priority features
label:"type: feature" label:"priority: high"

# Good first issues
label:"good first issue"

# Everything in triage
label:"status: triage"

# App bugs that need help
label:"type: bug" label:"scope: app" label:"help wanted"
```

### Saved Searches

Bookmark these useful filters:

| Filter | URL |
|--------|-----|
| Triage Queue | `is:issue is:open label:"status: triage"` |
| Ready to Work | `is:issue is:open label:"status: accepted"` |
| Beginner Friendly | `is:issue is:open label:"good first issue"` |
| Critical Issues | `is:issue is:open label:"priority: critical"` |

---

## Label Colors Reference

For maintainers creating or updating labels:

```yaml
# Type labels
type: bug:             "#d73a4a"
type: feature-request: "#1d76db"
type: feature:         "#a2eeef"
type: chore:           "#666666"
type: spike:           "#fbca04"
type: refactoring:     "#7057ff"
type: documentation:   "#0075ca"

# Status labels
status: triage:      "#e99695"
status: accepted:    "#0e8a16"
status: in progress: "#1d76db"
status: blocked:     "#b60205"
status: needs info:  "#d876e3"

# Priority labels
priority: critical:  "#b60205"
priority: high:      "#d93f0b"
priority: medium:    "#fbca04"
priority: low:       "#0e8a16"

# Scope labels
scope: app:          "#c5def5"
scope: docs:         "#bfdadc"
scope: ci/cd:        "#fef2c0"

# Special labels
good first issue:    "#7057ff"
help wanted:         "#008672"
breaking change:     "#b60205"
duplicate:           "#cfd3d7"
wontfix:             "#ffffff"
```
