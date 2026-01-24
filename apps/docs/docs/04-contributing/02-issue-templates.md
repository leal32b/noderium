# Issue Templates

We use structured issue templates to ensure consistency and gather all necessary information upfront. This helps maintainers triage issues faster and contributors understand what's expected.

## Available Templates

When you [create a new issue](https://github.com/leal32b/noderium/issues/new/choose), you'll see the following options:

| Template | Purpose | Labels |
|----------|---------|--------|
| 🐛 Bug Report | Report bugs or unexpected behavior | `type: bug`, `status: triage` |
| ✨ Feature Request | Suggest new features or enhancements | `type: feature`, `status: triage` |
| ♻️ Refactoring | Propose code improvements | `type: refactoring`, `status: triage` |
| 🔬 Spike / Research | Request technical investigation | `type: spike`, `status: triage` |
| 📚 Documentation | Report or improve documentation | `type: documentation`, `status: triage` |
| 🔧 Chore | Maintenance and housekeeping tasks | `type: chore`, `status: triage` |

---

## 🐛 Bug Report

Use this template when something isn't working as expected.

### When to Use

- Application crashes or freezes
- Features not working correctly
- Performance issues
- UI/UX problems
- Error messages

### Required Information

| Field | Description |
|-------|-------------|
| **Bug Description** | Clear explanation of what's wrong |
| **Expected Behavior** | What should happen |
| **Actual Behavior** | What actually happens |
| **Steps to Reproduce** | Detailed steps to recreate the issue |
| **Severity** | Critical / High / Medium / Low |
| **Version** | Noderium version you're using |
| **Operating System** | Your OS and version |

### Tips for Good Bug Reports

```markdown
✅ Good: "Clicking 'Save' on a new note causes the app to freeze for 5 seconds"
❌ Bad: "Save doesn't work"

✅ Good: "Steps: 1. Create new note, 2. Type 100+ characters, 3. Click Save"
❌ Bad: "Just click save and it breaks"
```

---

## ✨ Feature Request

Use this template to suggest new functionality or improvements.

### When to Use

- New features you'd like to see
- Enhancements to existing features
- UX improvements
- New integrations

### Key Sections

| Section | Purpose |
|---------|---------|
| **Problem Statement** | What problem does this solve? |
| **Proposed Solution** | How should it work? |
| **Alternatives Considered** | Other approaches you thought about |
| **User Story** | Who benefits and how? |
| **Acceptance Criteria** | What defines "done"? |

### Writing Effective User Stories

```markdown
As a [type of user],
I want [some goal],
So that [some reason].
```

**Example:**
```markdown
As a power user with multiple vaults,
I want to quickly switch between vaults using keyboard shortcuts,
So that I can maintain my flow without reaching for the mouse.
```

---

## ♻️ Refactoring

Use this template to propose code improvements that don't change functionality.

### When to Use

- Code cleanup and simplification
- Architecture improvements
- Design pattern implementations
- Technical debt reduction
- Performance optimizations (internal)
- Type safety improvements

### Important Considerations

| Aspect | Question to Answer |
|--------|-------------------|
| **Scope** | How many files/modules are affected? |
| **Breaking Changes** | Will this affect public APIs? |
| **Benefits** | What improvements will this bring? |
| **Risks** | What could go wrong? |

### Scope Levels

- **Small**: Single file or function
- **Medium**: Multiple files in same module
- **Large**: Multiple modules or cross-cutting
- **Major**: Architectural change

---

## 🔬 Spike / Research

Use this template for time-boxed technical investigations.

### When to Use

- Evaluating new technologies
- Researching implementation approaches
- Performance analysis
- Security assessments
- Proof of concept work

### Spike Types

| Type | Purpose |
|------|---------|
| **Technical Feasibility** | Can we do this? |
| **Architecture** | How should we structure this? |
| **Technology Evaluation** | Which tool/library should we use? |
| **Performance** | What are the performance characteristics? |
| **Security** | What are the security implications? |
| **Integration** | How do we integrate with X? |
| **Proof of Concept** | Build a working prototype |

### Expected Deliverables

Spikes should produce tangible outputs:

- Technical document or ADR (Architecture Decision Record)
- Proof of concept code
- Comparison matrix
- Recommendation document
- Demo or presentation

### Time-boxing

Spikes are time-limited to prevent scope creep:

- **1-2 hours**: Quick research
- **Half day**: Focused investigation
- **1 day**: Detailed analysis
- **2-3 days**: Complex evaluation
- **1 week**: Major investigation

---

## 📚 Documentation

Use this template for documentation improvements.

### When to Use

- Missing documentation
- Incorrect or outdated content
- Unclear explanations
- Incomplete guides
- Typos and formatting issues

### Documentation Types

- README files
- API documentation
- Getting Started guides
- How-to guides
- Architecture docs
- Contributing guides
- Code comments
- Changelog

### Issue Types

| Type | Description |
|------|-------------|
| **Missing** | Documentation doesn't exist |
| **Incorrect** | Documentation has errors |
| **Outdated** | Documentation needs updating |
| **Unclear** | Documentation is confusing |
| **Incomplete** | Documentation needs more detail |

---

## 🔧 Chore / Maintenance

Use this template for routine maintenance tasks.

### When to Use

- Dependency updates
- CI/CD improvements
- Build configuration changes
- Development tooling updates
- Repository maintenance
- Security patches

### Priority Levels

| Priority | When to Use |
|----------|-------------|
| **Low** | Can be done when convenient |
| **Medium** | Should be done in near future |
| **High** | Should be prioritized |
| **Critical** | Security or blocking issue |

---

## Best Practices

### Do's ✅

- **Search first**: Check if a similar issue exists
- **Be specific**: Provide detailed information
- **One issue, one topic**: Don't combine multiple issues
- **Use formatting**: Code blocks, lists, headers improve readability
- **Attach evidence**: Screenshots, logs, error messages help
- **Be respectful**: We're all here to help

### Don'ts ❌

- Don't open duplicates
- Don't be vague or generic
- Don't include sensitive information
- Don't demand immediate fixes
- Don't use issues for support questions (use Discussions)

---

## Issue Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Created   │────▶│    Triage    │────▶│   Accepted   │
│              │     │              │     │              │
│ status:      │     │ Maintainer   │     │ + priority   │
│ triage       │     │ reviews      │     │ + scope      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
       ┌─────────────────────────────────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ In Progress  │────▶│   Review     │────▶│    Closed    │
│              │     │              │     │              │
│ PR opened    │     │ PR merged    │     │ Issue done   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Need Help?

If you're unsure which template to use:

1. **Bug or not working** → Bug Report
2. **New capability** → Feature Request
3. **Code quality** → Refactoring
4. **Need to research** → Spike
5. **Docs problem** → Documentation
6. **Maintenance** → Chore
7. **Question** → [GitHub Discussions](https://github.com/leal32b/noderium/discussions)
