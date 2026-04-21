# Publishing `@smetp/*` to npm

## 1. Create the npm scope (once)

1. Sign in at [npmjs.com](https://www.npmjs.com/).
2. [Organizations](https://www.npmjs.com/org/create) → create **`@smetp`** (or join it if it already exists).
3. Add your user as an owner with publish rights on each package, or publish as the org’s first member.

Scoped packages default to private on paid plans; our `package.json` files set `"publishConfig": { "access": "public" }` so the first publish is public.

## 2. One-time login

```bash
npm login
npm whoami
```

For CI, use an automation token and `NPM_TOKEN` in the environment; `npm` will pick it up when `.npmrc` contains `//registry.npmjs.org/:_authToken=${NPM_TOKEN}` (many CI templates add this automatically).

## 3. Build and publish from this repo

Workspaces are defined in the root `package.json`. Dependency order is handled automatically.

```bash
# Dry run (no upload)
npm run smetp:publish -- --dry-run

# Actual publish (prompts for OTP if 2FA is enabled)
npm run smetp:publish
```

Under the hood this runs `npm run smetp:build` then publishes, in order:

1. `@smetp/spec`
2. `@smetp/runtime`
3. `@smetp/sdk`
4. `@smetp/cli`

Internal packages use semver ranges such as `"@smetp/spec": "^0.1.0"` so `npm install` at the repo root links workspace copies when versions match. Bump versions in every package that depends on a breaking release before publishing.

## 4. After changing APIs

1. Edit the relevant `packages/*/src` and README.
2. Bump **each** published package’s `version` in its `package.json` (semver).
3. Re-run `npm run smetp:publish`.

Keep the Next.js app’s path aliases in sync with breaking spec changes, or depend on published versions from npm instead of `workspace:*` for the app (optional follow-up).

## 5. Open-source mirror

The `repository` field in each package points at `https://github.com/goker/SMETP-Subject-Matter-Expertise-Transfer-Protocol.git`. When syncing that repo with this monorepo, either:

- **Subtree / sync**: periodically push `packages/*` + docs into that repo, or  
- **Extract**: move `packages/` to the public repo and consume it from the private app via versioned npm deps.

The plan treats the public repo as the home for the protocol; the hosted product remains in this app repo.
