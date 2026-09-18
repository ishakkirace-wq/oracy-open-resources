# Privacy, safeguarding and child safety

## Current prototype

The current prototype does not collect or transmit personal data to a project-controlled service. It has no account, backend, analytics, recording feature or remote AI. User interaction stays in page memory. A drawing is saved only when the user explicitly downloads a PNG to their device.

Sleeping Dragon may request microphone permission after the teacher presses **Start local listening**. Audio samples are processed in the browser to obtain a relative amplitude value. They are not recorded, transcribed, identified, persisted, sent to a server or connected to speaker output. The stream stops when listening ends, the page is hidden or the activity closes. Quiet/Medium/Loud preview controls provide a microphone-free alternative. The displayed value is not calibrated in decibels and must not be treated as an individual behaviour score.

Listening Detectives will use only a locally installed English speech-synthesis voice when one is exposed by the browser. If a local voice is unavailable, the feature stops and asks the teacher to read the transcript.

## Before any school pilot

At minimum, complete:

- a data protection impact assessment covering applicable GDPR/KVKK duties;
- a child-safeguarding and incident-response plan;
- role-based access and data-retention rules if accounts are added;
- plain-language notices for schools, educators, parents and learners;
- organisational agreements and consent/assent processes appropriate to the study and jurisdiction;
- accessibility review with disabled users;
- security threat modelling and penetration testing; and
- documented human review for any generated educational material.

Do not treat click-through acceptance alone as a complete legal or ethical basis for processing children's data.

## Prohibited AI uses

The project should not infer emotion, identity, disability, behaviour, truthfulness or protected characteristics; rank children; make high-stakes decisions; or present generated assessment as objective fact. Any future AI component must be optional, teacher-facing, transparent and subject to a documented human decision.
