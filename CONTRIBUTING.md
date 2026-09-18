# Contributing

Thank you for helping make classroom talk more purposeful and inclusive.

## Before proposing a change

Open an issue that explains the learner need, teacher workflow and evidence for the change. A new feature should not introduce automatic judgement of a child's language, identity, emotion, behaviour or ability.

## Development rules

- Keep the default build usable without an account or remote service.
- Do not commit personal data, school records, credentials, nonces, private endpoints or production exports.
- Do not add tracking, advertising or behavioural analytics.
- Document all new assets in `docs/PROVENANCE-AND-RIGHTS.md` before committing them.
- Provide keyboard access, visible focus, readable contrast and reduced-motion behaviour.
- Give teachers control over semantic decisions and progression.
- Label experimental and proposed capabilities honestly.
- Add or update tests for functional, privacy and accessibility behaviour.

## Local checks

```sh
npm test
python3 -m http.server 8000 --bind 127.0.0.1
```

Then complete the browser checks in `docs/TESTING.md` at desktop and narrow mobile widths.

## Pull requests

Describe the educational purpose, data-flow change, accessibility impact, test evidence and asset rights. A maintainer may request pedagogical, privacy, safeguarding or legal review before merging.

