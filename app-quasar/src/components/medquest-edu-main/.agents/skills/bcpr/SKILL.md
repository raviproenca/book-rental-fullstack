---
name: bcpr
description: >-
  Default local Git workflow for this repo: always branch from up-to-date `develop`, use
  Conventional Commits only (grouped by context), open PRs with `--base develop` and
  `.github/pull_request_template.md` via `gh pr create` (ready for review, not draft, unless the user asks). Triggers —
  English: implement/add/build, commit, open/create/generate PR, wrap up, finish, close the cycle;
  Portuguese: criar branch a partir de develop, commits, abrir/criar PR para develop, finalizar.
---

# Git Workflow — Branch, Conventional Commits & Pull Request

## Related skills

- **Spec-driven PR (MCP / GitHub tools):** use [`create-github-pull-request-from-specification`](../create-github-pull-request-from-specification/SKILL.md) when the flow is driven from a specification file and tooling. **BCPR** is the default **local Git** path: sync `develop` → branch from `develop` → Conventional Commits only → filled template → `gh pr create --base develop`.

You are a specialized Git agent. Whenever the user asks to implement something, follow this flow automatically: integration branch is **`develop`** (not `main`), and every commit must follow Conventional Commits unless the user explicitly overrides.

---

## 1. BRANCH CREATION

Whenever the user passes a prompt requesting a new feature, fix, or task, create a branch **before any code changes**.

**Always branch from `develop`:** do not create work branches from `main`, `master`, or the current detached/unknown HEAD unless `develop` is truly unavailable (then ask). Update `develop` first, then create the branch.

### Naming convention
```
<type>/<short-scope-in-kebab-case>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Refactor with no behavior change |
| `chore` | Config, deps, scripts, CI |
| `docs` | Documentation |
| `test` | Adding or fixing tests |
| `hotfix` | Critical production fix |

**Examples:**
- `feat/user-authentication`
- `fix/payment-timeout`
- `refactor/pricing-service`

### Command
```bash
git checkout develop
git pull origin develop
git checkout -b <type>/<scope>
```

If `develop` does not exist locally yet:

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git checkout -b <type>/<scope>
```

> ⚠️ NEVER commit directly to `main`, `master`, or `develop` (no direct pushes to those branches).
> If a relevant branch already exists for the context, ask before creating a new one.

---

## 2. CONVENTIONAL COMMITS

**Mandatory for every BCPR branch:** every commit must follow Conventional Commits. Do not use vague or one-line messages (`wip`, `fix stuff`, etc.) unless the user explicitly asks to override this workflow.

All commits **must** strictly follow the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### Specification

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types (required)

| Type | Description |
|------|-------------|
| `feat` | A new feature (correlates with MINOR in SemVer) |
| `fix` | A bug fix (correlates with PATCH in SemVer) |
| `docs` | Documentation only changes |
| `style` | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.) |
| `refactor` | A code change that neither fixes a bug nor adds a feature |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `build` | Changes that affect the build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

#### Scope (optional)
A noun describing the section of the codebase affected, enclosed in parentheses.
Examples: `feat(auth)`, `fix(api)`, `refactor(billing)`

#### Description (required)
- Lowercase, imperative mood ("add" not "added" or "adds")
- No period at the end
- Max 72 characters

#### Body (optional)
- Separated from description by a blank line
- Explains the **why**, not the what
- Free-form text, wrap at 72 characters

#### Footer (optional)
- Separated from body by a blank line
- `BREAKING CHANGE: <description>` — triggers a MAJOR version bump in SemVer
- `Closes #<issue>`, `Refs #<issue>`, `Co-authored-by: Name <email>`

#### Breaking Changes
Two valid ways to indicate a breaking change:
```
feat!: allow provided config object to extend other configs
```
```
feat(api)!: send an email to the customer when a product is shipped

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Rules
- Group changes by feature/context and create **separate commits for each group**
- Never mix different types (e.g., `feat` + `fix`) in the same commit
- Never mix unrelated scopes in the same commit
- Use `git add -p` mentally for granular staging
- Each commit must be self-contained and independently understandable

### Example sequence
```bash
# Context 1 — data model
git add src/models/user.ts
git commit -m "feat(user): add subscription tier field to user model"

# Context 2 — business logic
git add src/services/billing.ts
git commit -m "feat(billing): implement tier-based pricing calculation"

# Context 3 — UI
git add src/components/PricingCard.tsx
git commit -m "feat(ui): add pricing card with tier selector"

# Context 4 — tests
git add src/tests/billing.test.ts
git commit -m "test(billing): add unit tests for tier pricing logic"

# Context 5 — breaking change example
git add src/api/auth.ts
git commit -m "feat(auth)!: replace JWT with OAuth2 session tokens

BREAKING CHANGE: clients must now use OAuth2 flow; existing JWT tokens will be rejected"
```

### Common scopes
`api`, `ui`, `auth`, `db`, `config`, `types`, `tests`, `docs`, `ci`, `hooks`, `router`, `store`, `middleware`

---

## 3. PULL REQUEST GENERATION

When the user asks to open a PR, create the file `.github/pull_request_template.md` at the project root (if it doesn't exist yet) using the exact template below, then run the `gh pr create` command.

### Creating the PR template

Create `.github/pull_request_template.md` with this exact content:

```markdown
## 📋 Description

<!-- Explain what was done and WHY. Don't repeat the title. -->

**Context:**

**Solution:**

---

## 🔖 Type of change

- [ ] `feat` — New feature
- [ ] `fix` — Bug fix
- [ ] `refactor` — Refactor (no behavior change)
- [ ] `chore` — Config, dependencies, CI/CD
- [ ] `docs` — Documentation
- [ ] `test` — Adding or fixing tests
- [ ] `hotfix` — Critical production fix
- [ ] `breaking change` — Breaks backward compatibility

---

## ✅ Required checklist

### Code
- [ ] Code compiles without errors
- [ ] No leftover `console.log`, `debugger`, or commented-out code
- [ ] New environment variables were added to `.env.example`
- [ ] No hardcoded credentials, tokens, or secrets

### Logic & Functionality
- [ ] Feature was manually tested in local environment
- [ ] Edge cases were considered
- [ ] No regressions in existing functionality
- [ ] Errors are handled correctly (no silent failures)

### Database
- [ ] Migrations were created (if schema changed)
- [ ] Migrations are reversible (`up` and `down`)
- [ ] Necessary indexes were added
- [ ] No N+1 queries were introduced

### API & Contracts
- [ ] New endpoints are documented
- [ ] No breaking changes in APIs consumed by other services
- [ ] Responses follow the project's standard
- [ ] Rate limiting was considered (if applicable)

### Security
- [ ] User inputs are validated/sanitized
- [ ] Protected routes have proper authentication/authorization
- [ ] No sensitive data exposed in logs or responses

### Tests
- [ ] Unit tests were written or updated
- [ ] Integration tests cover the main flow
- [ ] All existing tests pass (`npm test` / equivalent)

### Frontend (if applicable)
- [ ] Works on mobile and desktop
- [ ] Loading, error, and empty states are implemented
- [ ] Basic accessibility verified (alt text, contrast, keyboard nav)
- [ ] No broken layout across different viewports

---

## 🔗 References

**Related issue:** Closes #<!-- issue number -->

**Design / Docs:** <!-- Figma, Notion, or other link if available -->

---

## 📸 Screenshots / Evidence

<!-- If there's a visual change, add before/after. For APIs, paste the Insomnia/Postman result. -->

| Before | After |
|--------|-------|
|  |  |

---

## ⚠️ Notes for the reviewer

<!-- Anything that deserves special attention? Controversial technical decision? Known technical debt? -->

---

## 🚀 Deploy notes

- [ ] Requires new environment variables on the server
- [ ] Requires running migration before deploy
- [ ] Requires restart of dependent services
- [ ] Requires update of external documentation
```

### PR creation command
```bash
gh pr create \
  --title "<type>(<scope>): <description>" \
  --body-file .github/pull_request_template.md \
  --base develop
```

> **Default merge target:** open every PR against **`develop`** (`--base develop`), **ready for review** (do not pass `--draft` unless the user explicitly wants a draft PR).
> The PR title must also follow Conventional Commits format.

### Auto-filling the template
When generating the PR, fill in:
1. **Title** following the Conventional Commits pattern
2. **Description** with a summary of what was done and why
3. **Change list** based on the branch's commits
4. **Checklist** checking only items that can be automatically verified
5. **Related issue** if the user mentioned one

---

## FULL FLOW — Summary

```
1. User asks for something
         ↓
2. Sync develop → create branch from develop  →  git checkout develop && git pull && git checkout -b feat/name
         ↓
3. Implement changes
         ↓
4. User asks for commits  →  separate Conventional Commits by context (mandatory)
         ↓
5. User asks for PR  →  create template if missing + gh pr create --base develop
```

---

## ACTIVATION TRIGGERS

| User says | Action |
|---|---|
| "create / implement / add / build [X]" | Sync `develop`, create branch from `develop`, ask if ready to start |
| "commit", "make commits", "generate commits" | Analyze changes and create Conventional Commits by context |
| "open PR", "create PR", "generate PR" | Create template if missing + run `gh pr create --base develop` |
| "wrap up", "finish", "close the cycle" | Conventional Commits + push + `gh pr create --base develop` in sequence |
