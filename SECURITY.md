# Security Policy

This is a personal/demo educational project. If you discover a security vulnerability, please report it
privately rather than opening a public GitHub issue:

- Open a [GitHub Security Advisory](../../security/advisories/new) on this repository (preferred), or
- Contact the repository owner directly.

Please include steps to reproduce, the affected file(s)/endpoint(s), and potential impact. We'll
acknowledge reports as soon as possible and aim to resolve confirmed issues promptly.

## Scope notes
- This project never accepts or stores full Social Security Numbers or full Medicare Beneficiary
  Identifiers — do not submit real, sensitive personal data through the chat when testing.
- `OPENAI_API_KEY` must never be committed; it belongs only in a local, gitignored `.env` file or in the
  hosting platform's (Vercel) encrypted environment variable store. n8n credentials live only inside your
  own separately-managed n8n instance and are never part of this repo.

## Known accepted findings
- `npm audit` reports a moderate-severity XSS advisory in a version of `postcss` bundled *inside* Next.js's
  own `node_modules/next/node_modules/postcss` (build-time CSS stringification, not exposed to user input
  in this app). The only "fix" `npm audit fix --force` offers is downgrading `next` to v9, which would
  reintroduce far more severe, actually-exploitable issues — so this is accepted as low-risk until
  upstream Next.js ships a patched bundled `postcss`. Re-run `npm audit` after any Next.js version bump to
  check if it's resolved.
