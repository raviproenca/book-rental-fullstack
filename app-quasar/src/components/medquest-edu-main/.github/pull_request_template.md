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
