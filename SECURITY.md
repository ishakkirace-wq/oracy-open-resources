# Security policy

## Supported version

Only the latest commit on the default branch is supported during the reference-prototype phase.

## Report a vulnerability privately

Do not open a public issue for a vulnerability that could expose children, educators, schools or private data. Send a private report to the repository owner using the contact channel listed on the repository profile. Include:

- the affected file and behaviour;
- browser and operating-system details;
- safe reproduction steps;
- the likely impact; and
- any suggested mitigation.

Do not include real learner data or test against a school system without written authorisation.

## Current security boundary

The shipped prototype is static and intentionally has no account system, backend, analytics or remote API. Its Content Security Policy sets `connect-src 'none'`. Sleeping Dragon can request microphone permission; the stream is analysed locally, is never connected to speaker output, and its tracks and audio context are stopped when listening ends or the activity closes. These constraints reduce the attack surface but do not replace review before deployment.

Future server, AI, account, file-upload or child-data features must receive a threat model, privacy impact assessment and independent security review before a pilot.
