# Payspace OTP box fix (Firefox)

Turns the single OTP password field on Payspace into one box per digit, with
paste-to-split. A complete 6-digit code auto-submits the form (like GitHub).

Scoped to **`https://identity.yourhcm.com/mfa/signin`** only — it does nothing on
any other page or site. The original `#OneTimePassword` input stays in the form
(hidden) and is kept in sync, so Payspace's own jQuery validation and POST still
work; the boxes are just a nicer front end over it.

## Files
- `manifest.json` — MV3; matches `identity.yourhcm.com/mfa/signin`; declares no data collection.
- `otp-enhance.js` — content script (finds the field, builds the boxes, syncs, auto-submits).
- `otp-enhance.css` — box styling.
- `icon.svg` — extension icon.
- `test.html` — local demo mirroring the real page (dev-only; not shipped).
- `web-ext-artifacts/payspace_otp_box_fix-<version>.zip` — build output from `web-ext build` (gitignored, not committed).

## Behaviour
- Six `type="text"` boxes, `inputmode="numeric"` (no number-spinner arrows).
- Paste-to-split into the first box; also handles pasting into a middle box.
- Auto-advance on type, Backspace clears/steps back, arrow/Home/End navigation.
- Auto-submit once all six digits are present; backspacing within ~120 ms cancels it.
- Boxes carry password-manager ignore attributes (ProtonPass/1Password/LastPass/
  Bitwarden); the first box keeps `autocomplete="one-time-code"` for OS SMS autofill.

## Test locally
Open `test.html` in Firefox. Paste `123456` into the first box — it fills all
boxes and bumps the "submit count".

## Load temporarily (clears on restart)
`about:debugging#/runtime/this-firefox` → **Load Temporary Add-on…** → pick
`manifest.json`.

## Build the package
```
cd yourhcm-otp-extension
npx web-ext lint  --source-dir . --ignore-files test.html README.md 'web-ext-artifacts/**'
npx web-ext build --source-dir . --ignore-files test.html README.md 'web-ext-artifacts/**' --overwrite-dest
```
The zip lands in `web-ext-artifacts/`.

## Publish on addons.mozilla.org (AMO)
1. Sign in / register a Firefox Add-on Developer account at
   https://addons.mozilla.org/developers/ — use **oliver.maksimovic@pm.me**.
   (This is the one place the author email is actually required; it isn't stored
   in the extension files.)
2. **Submit a New Add-on** → distribution **On this site** (listed).
3. Upload `web-ext-artifacts/payspace_otp_box_fix-<version>.zip`. AMO runs the
   same validator (0 errors) and signs it.
4. No source-code upload is needed — the JS/CSS ship unminified and unbundled.
5. Listing metadata: the name and summary come from the manifest; add a longer
   description and pick a category. For the data-collection question, answer
   **“Doesn’t collect any data”** (matches `data_collection_permissions: none`).
6. Submit for review. Because it requests host access to one site and collects
   nothing, review is straightforward.

To ship an update later: bump `version` in `manifest.json`, rebuild, and upload
the new zip to the same add-on listing.
