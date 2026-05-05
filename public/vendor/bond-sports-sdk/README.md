# Bond Sports SDK — vendored bundle

`BondSportsSdk.js` here is the IIFE bundle produced by the private repo
[`Bond-Sports/api-sdk`](https://github.com/Bond-Sports/api-sdk). The repo intentionally `.gitignore`s
`dist/`, so consumers must build the bundle locally and copy it in.

## How to refresh this bundle

```bash
git clone git@github.com:Bond-Sports/api-sdk.git /tmp/bond-api-sdk
cd /tmp/bond-api-sdk
npm ci
npm run build
cp dist/BondSportsSdk.js <rental-portal-fun>/public/vendor/bond-sports-sdk/BondSportsSdk.js
cp -R dist/.source-sdk <rental-portal-fun>/src/vendor/bond-sports-sdk/source-sdk
cp dist/BondSportsApi.d.ts <rental-portal-fun>/src/vendor/bond-sports-sdk/BondSportsApi.d.ts
cp dist/errors.d.ts        <rental-portal-fun>/src/vendor/bond-sports-sdk/errors.d.ts
cp dist/index.d.ts         <rental-portal-fun>/src/vendor/bond-sports-sdk/index.d.ts
cp -R dist/types           <rental-portal-fun>/src/vendor/bond-sports-sdk/types
```

After copying, fix the two SDK type files that import from `./.source-sdk`:

- `src/vendor/bond-sports-sdk/index.d.ts` — change `./.source-sdk/index` → `./source-sdk/index`
- `src/vendor/bond-sports-sdk/BondSportsApi.d.ts` — change `./.source-sdk` → `./source-sdk`

The `.` prefix is dropped because Next.js / TS pick up source files from
`src/vendor/bond-sports-sdk/` and the leading dot collides with hidden-file globs.

The runtime JS (this file) keeps its original layout — the bundle is an IIFE that exposes a global
`BondSportsSdk` once loaded via `<script src="/vendor/bond-sports-sdk/BondSportsSdk.js">`.
