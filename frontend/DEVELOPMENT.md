# Development Guidelines

This document explains the development guardrails installed in the frontend codebase.

---

## 1. Linting (ESLint)

ESLint enforces code quality rules on every `.ts` and `.tsx` file.

| Rule | Level | Purpose |
|---|---|---|
| `no-console` | warn | Flags console usage; stripped in production builds |
| `no-debugger` | error | Blocks debugger statements |
| `no-var` | error | Enforces `let` / `const` |
| `prefer-const` | error | Enforces `const` when variable is never reassigned |
| `eqeqeq` | error | Enforces strict equality (`===` / `!==`) |
| `consistent-return` | error | Requires consistent return values in functions |
| `no-unreachable` | error | Blocks dead code after return/throw/break |
| `no-duplicate-imports` | error | Prevents duplicate import statements |
| `@typescript-eslint/no-unused-vars` | error | Blocks unused variables (prefix with `_` to allow) |

### Commands

```bash
npm run lint          # Check for lint issues
npm run lint:fix      # Auto-fix lint issues
```

---

## 2. Formatting (Prettier)

Prettier enforces consistent code formatting.

| Setting | Value |
|---|---|
| Print width | 100 characters |
| Tab width | 2 spaces |
| Semicolons | Always |
| Quotes | Single quotes |
| Trailing commas | All |
| Arrow parens | Always |
| Bracket spacing | Yes |
| End of line | Auto |

### Commands

```bash
npm run format        # Format all files
npm run format:check  # Check formatting (no changes)
```

---

## 3. Console Stripping (Production)

The Vite build automatically strips **all** `console.*` and `debugger` statements from production bundles via `esbuild.drop`.

- **Development**: `console.log` works normally (ESLint shows a warning)
- **Production build**: All console/debugger calls are removed from the output

---

## 4. Pre-Commit Hooks (Husky + lint-staged)

Every `git commit` automatically runs these checks on staged files:

| File type | Checks |
|---|---|
| `*.ts`, `*.tsx` | ESLint (auto-fix) + Prettier (auto-format) |
| `*.json`, `*.css`, `*.md` | Prettier (auto-format) |

If ESLint reports any errors (warnings are tolerated), **the commit is blocked**.

---

## 5. NPM Scripts Reference

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build (strips console/debugger) |
| `npm run lint` | Run ESLint on all source files |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without modifying files |
| `npm run typecheck` | Run TypeScript type checking (no emit) |
| `npm run check` | Run lint + format check + type check |
| `npm run validate` | Full validation: check + production build |

---

## 6. Development Workflow

### Daily workflow

1. Write code normally — ESLint warnings appear in your editor
2. Run `npm run lint:fix` to auto-fix issues before committing
3. `git commit` triggers pre-commit hook automatically
4. If hooks fail, fix the issues and commit again

### Before opening a PR

```bash
npm run validate
```

This runs the full pipeline: lint → format check → type check → production build.

### Suppressing unused-var errors

Prefix unused parameters with an underscore:

```typescript
// ✅ Correct — underscore prefix is allowed
const handler = (_event: Event) => { ... };

// ❌ Error — unused variable
const handler = (event: Event) => { ... };
```
