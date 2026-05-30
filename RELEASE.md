# Release checklist — project-memory-cli

Publishing is **manual**. The automated script verifies readiness only; it does not publish.

---

## Prerequisites

1. **npm account** with publish access to [`project-memory-cli`](https://www.npmjs.com/package/project-memory-cli).
2. **Logged in locally:**
   ```bash
   npm login
   npm whoami
   ```
3. **Clean git state** — commit all changes intended for the release.
4. **Node.js 18+** installed.

---

## 1. Version bump

Update the version in:

- `package.json`
- `package-lock.json` (run `npm install` after editing `package.json`, or use `npm version`)

Use [semver](https://semver.org/):

- **patch** — bug fixes, docs, tests
- **minor** — new commands or backward-compatible features
- **major** — breaking CLI or scaffold spec changes

```bash
# Example: patch bump (updates package.json, package-lock.json, creates git commit + tag)
npm version patch
```

Or edit `package.json` manually and run `npm install` to refresh the lockfile.

---

## 2. Build and test

```bash
npm run release:check
```

This runs:

1. Clean build (`dist/` removed, then `tsc`)
2. Smoke tests (`scripts/smoke.mjs`)
3. E2E audit (`scripts/e2e-audit.mjs`)
4. `npm pack --dry-run` (required files present, no `src/` or `scripts/` in tarball)
5. Pack, install tarball in a temp dir, verify `project-memory --version`, `init --new --yes`, and `validate`

Shorter alternatives during development:

```bash
npm test          # build + smoke + e2e
npm run smoke     # CLI unit-style tests only
```

**Do not publish if `release:check` fails.**

---

## 3. Review the tarball (optional)

```bash
npm pack --dry-run
```

Confirm the package includes:

- `dist/` (compiled CLI)
- `README.md`
- `SPEC.md`
- `LICENSE.md`
- `package.json`

It should **not** include `src/`, `scripts/`, tests, or local artifacts.

---

## 4. Publish to npm

```bash
npm publish
```

`prepublishOnly` runs `npm run build` automatically before publish.

For a **dry run** without uploading:

```bash
npm publish --dry-run
```

---

## 5. Git tag

If you used `npm version`, a tag may already exist. Otherwise:

```bash
git tag v0.1.1
git push origin main --tags
```

Replace `0.1.1` with the released version.

---

## 6. Post-publish verification

From a **clean temp directory** (not the repo root):

```bash
npm install -g project-memory-cli
project-memory --version
mkdir test-project && cd test-project
project-memory init --new --yes
project-memory validate
project-memory status
```

Or without a global install:

```bash
npx project-memory-cli init --new --yes
```

Use the **package name** `project-memory-cli`, not `project-memory` (a different npm package).

Verify on npm:

- https://www.npmjs.com/package/project-memory-cli

---

## Quick reference

| Step | Command |
|------|---------|
| Release check | `npm run release:check` |
| Login | `npm login` |
| Version bump | `npm version patch` (or minor/major) |
| Publish | `npm publish` |
| Tag | `git push origin main --tags` |

---

## Troubleshooting

| Problem | Action |
|---------|--------|
| `npm publish` 403 | Check `npm whoami` and package name ownership |
| Wrong version on npm | Bump version; cannot republish same version |
| `npx project-memory` fails | Use `npx project-memory-cli` or install globally |
| Tests pass locally, pack fails | Run `npm run release:check` — inspect pack dry-run output |
