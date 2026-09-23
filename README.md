# Payspace OTP box fix (Firefox)

Turns the single OTP password field on Payspace into one box per digit, with paste-to-split. A complete 6-digit code auto-submits the form (like GitHub).

Scoped to `https://identity.yourhcm.com/mfa/signin` only — it does nothing on any other page or site. The original `#OneTimePassword` input stays in the form (hidden) and is kept in sync, so Payspace's own jQuery validation and POST still work; the boxes are just a nicer front end over it.

## Behaviour

- Six `type="text"` boxes, `inputmode="numeric"` (no number-spinner arrows).
- Paste-to-split into the first box; also handles pasting into a middle box.
- Auto-advance on type, Backspace clears/steps back, arrow/Home/End navigation.
- Auto-submit once all six digits are present; backspacing within ~120 ms cancels it.
- Boxes carry password-manager ignore attributes (ProtonPass/1Password/LastPass/Bitwarden); the first box keeps `autocomplete="one-time-code"` for OS SMS autofill.

## Install

For dev: load `manifest.json` at `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on**. Packaged `.zip` builds are attached to each [release](../../releases).

## License

[Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/) (MPL-2.0).
