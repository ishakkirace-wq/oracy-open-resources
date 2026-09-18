# Source audit

Audit date: 19 September 2026.

## Audit boundary

This public report records the decisions and verification relevant to the released files. Private archive names, internal paths, checksums and production identifiers are deliberately omitted because they are not needed to use, review or reproduce the open package.

## Included as reduced reference implementations

| Component | Decision | Reason |
|---|---|---|
| Sleeping Dragon | Included as a media-free derivative | Preserves the owner's seven-state transition and threshold-crossing logic; uses CSS-native shapes, local-only amplitude analysis and microphone-free preview controls; original media is not copied |
| Magic Train | Included, rewritten without production media, accounts or network calls | Strong teacher-controlled structure for observation, inference, reasoning and collaborative talk |
| Listening Detectives | Included, reduced to local transcripts and optional installed-device read-aloud | Strong listening, evidence and retelling focus; useful offline fallback |
| Story Machine | Included, rewritten without production art or account storage | Strong narrative structure, turn-taking and contribution-linking workflow; user text remains in page memory |
| Emotion Studio | Included, rewritten without production art, audio or recording | Strong vocal interpretation and evidence-based discussion; explicitly performs no automated emotion detection |
| Describe & Draw | Included with source-coded geometric SVG scenes | Strong description, clarification and active-listening workflow; no binary asset dependency |

## Excluded from this staging repository

| Component | Decision | Reason |
|---|---|---|
| Original Sleeping Dragon video/image/icon media | Excluded | Media is unnecessary for the reference implementation and is outside the public release |
| Voice Rocket | Excluded | Depends on a large set of production videos with no complete file-level redistribution inventory; also duplicates the sound-regulation focus already represented by Sleeping Dragon |
| Mystery Window | Excluded | Production images/videos have incomplete rights records and the source retains local database/account integration patterns not required for the open reference |
| Talk Bridge | Excluded | Internal notes identify it as a future item; including it could overstate delivery status |
| Oracy World | Excluded | Commercial product outside the proposed open scope |
| OracyNet | Excluded | Commercial platform outside the proposed open scope |
| WordPress/resources plug-in | Excluded | Contains authentication, delivery, account, nonce, local-cache and production-integration code beyond the standalone scope |
| Board and anthology files | Excluded | Outside the proposed repository scope |
| Video demo production files | Excluded | Application collateral, not reusable classroom source |
| All non-included binary production media | Excluded | The reference implementation is deliberately source-text-only |
| Brand images and logos | Excluded | Trademarked brand material should remain outside general open licences |

## Security and privacy findings

The broader production system contains account-connected and deployment-specific features. Those features were unnecessary for the funding reference and were not copied.

The new runnable files contain no network request primitive, endpoint, account identifier, API key or production credential. The browser policy disables outbound connections. Sleeping Dragon can request microphone permission only after a user action; its source connects the stream to a local analyser, never to audio output or a recorder, and releases the stream on stop, hide or activity teardown.

## Licensing resolution

The owner confirmed authority to license the code and content included in this reduced repository and approved public release under MIT for software and CC BY 4.0 for original educational content.

That approval applies only to files actually present here. It does not extend to excluded video, audio, image, font, model or other production assets. Trademarks remain outside both public licences.

## Verification completed during the audit

- The public-release repository passed all 29 dependency-free checks. Twenty-one cover adapted Sleeping Dragon logic, media boundaries and privacy; eight cover repository syntax, scope, licensing, privacy and truthful AI status.
- Every static entry file was served successfully from a local Python HTTP server.
- A graphical browser smoke test remains to be completed on a workstation with a Chromium, Firefox or WebKit executable; the audit environment exposed Playwright's library but no browser binary.
