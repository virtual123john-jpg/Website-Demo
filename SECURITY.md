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
- `OPENAI_API_KEY` and n8n basic-auth credentials must never be committed; they belong only in a local,
  gitignored `.env` file or in the hosting platform's (Vercel) encrypted environment variable store.
