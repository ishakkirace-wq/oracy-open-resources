# Open Oracy Classroom

Open Oracy Classroom is a funding-review reference implementation of small, teacher-led classroom activities for purposeful speaking and listening.

This repository is deliberately narrow. It contains six runnable browser activities that work without accounts, analytics, remote APIs or production media:

1. **Sleeping Dragon** — shared voice-level awareness using local signal analysis, a CSS-native dragon and microphone-free preview controls.
2. **Magic Train** — observation, inference, reasons and group decisions across three teacher-controlled stops.
3. **Listening Detectives** — listening for detail, distinguishing evidence from inference and retelling accurately.
4. **Story Machine** — narrative structure, turn-taking, coherence and building on another learner's contribution.
5. **Emotion Studio** — interpretation of pace, pause, stress and intonation without automated emotion detection.
6. **Describe & Draw** — precise description, clarification questions, active listening and reflection through drawing.

The repository does **not** contain Oracy World, OracyNet, WordPress code, school accounts, student records or production credentials. The original Sleeping Dragon animation and image assets are not included because their redistribution rights have not yet been documented; the included version replaces them with source-coded CSS shapes.

## Status

- **Version:** `0.2.0`
- **Purpose:** public open-source reference release, funding review and technical due diligence
- **Production status:** reference prototype, not a production service
- **AI status:** the teacher-facing AI scaffolding component described in the proposal is proposed work and is **not implemented** here.

The activities do not claim to assess language ability, infer learning, identify speakers or measure classroom quality. No learning-impact or pilot result is represented by this code.

## Run locally

No package installation or build step is required.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/` in a current browser.

The interface can also be hosted as static files. Its Content Security Policy disables outbound connections. Listening Detectives can optionally use an English voice already installed on the device; if none is available, the teacher reads the displayed transcript. Sleeping Dragon may request microphone access over localhost or HTTPS, but reduces the live signal to a relative amplitude value on the device and never records or uploads audio.

## Test

Node.js 20 or later is required for the repository checks.

```sh
npm test
```

The 29 checks include 21 adapted Sleeping Dragon state, threshold, media-safety and privacy tests, plus repository scope, syntax, licensing, Content Security Policy and truthful-AI checks. See [docs/TESTING.md](docs/TESTING.md) for the separate browser smoke test.

## Data behaviour

| Capability | Behaviour in this repository |
|---|---|
| Accounts | None |
| Remote requests | Disabled by code and Content Security Policy |
| Analytics | None |
| Advertising or tracking | None |
| Microphone access | Optional in Sleeping Dragon; explicit browser permission, local relative-level analysis only |
| Audio recording | None |
| AI inference | None |
| Persistence | None; drawings remain in memory unless the user downloads a PNG |
| Installed-device speech | Optional, local English voice only; teacher-read fallback |

## Repository layout

```text
activities/                 Six self-contained activities plus the tested dragon core
docs/                       Scope, pedagogy, architecture, rights and safety notes
tests/                      Dependency-free repository checks
app.js                      Small activity registry and lifecycle manager
index.html                  Static entry page and restrictive CSP
styles.css                  Shared responsive presentation
ROADMAP.md                  Proposed 12-month development path
LICENSE                     MIT software licence
LICENSE-CONTENT.md          CC BY 4.0 licence for educational content
NOTICE.md                   Trademark and excluded-media boundaries
```

## What was intentionally excluded

- commercial or account-connected product code;
- Oracy World and OracyNet;
- WordPress plug-in, authentication and teacher-account components;
- student, teacher, school or customer data;
- API keys, nonces, credentials, endpoints and analytics;
- production branding files;
- all MP4 files and binary images with incomplete rights records;
- original Sleeping Dragon videos/images and all other uncleared production media;
- synthetic narration and application-video production files;
- any claim that proposed AI or pilot activity already exists.

The public release decisions and verification results are recorded in [docs/SOURCE-AUDIT.md](docs/SOURCE-AUDIT.md).

## Licensing

The owner has approved this public split-licence release:

- Software, tests, styles and application structure are licensed under the [MIT License](LICENSE).
- Original documentation, teaching prompts, sample dialogue and pedagogical text are licensed under [CC BY 4.0](LICENSE-CONTENT.md).
- In mixed source files, executable code is MIT-licensed while human-readable educational content is CC BY 4.0-licensed.
- Company and product names, logos, word marks, trade dress and other trademarks are not licensed.
- No licence is granted for binary media or production assets that are not present in this repository.

Copyright © 2026 Oracy Eğitim Danışmanlık Yayıncılık Ltd. Şti. Founder: Dr Ishak Ersin Kirac. See [NOTICE.md](NOTICE.md) for the precise trademark and excluded-media boundaries.

## Reporting problems

For security and privacy reports, follow [SECURITY.md](SECURITY.md). For proposed changes, see [CONTRIBUTING.md](CONTRIBUTING.md).
