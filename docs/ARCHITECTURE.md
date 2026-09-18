# Architecture

## Runtime

The project is a dependency-free static site:

- `index.html` defines the page shell and Content Security Policy.
- `app.js` registers activities and owns their lifecycle.
- each file in `activities/` registers one module with `mount(host, api)`;
- `sleeping-dragon-core.js` exposes a deterministic state machine and threshold-crossing counter used by both the interface and Node tests;
- `styles.css` supplies responsive presentation; and
- no service worker, database, server or remote request is used.

When a learner or teacher leaves an activity, the runtime removes registered event handlers and activity state. Sleeping Dragon also stops every microphone track, cancels its animation frame and closes its audio context. The application does not persist activity data.

## Security properties

- `connect-src 'none'` prevents network requests from the page under supporting browsers.
- Scripts and styles load only from the same origin.
- There is no inline script or inline style attribute.
- There is no HTML form submission.
- There are no credentials, tokens or API endpoints.
- Sleeping Dragon's optional microphone source connects only to a local analyser, never to audio output or a recorder.
- Static SVG reference scenes are included as fixed source strings; there is no user-authored HTML rendering.

## Deployment

Any static web server can host the directory. HTTPS is recommended even though the prototype requests no sensitive browser capability. Do not add third-party analytics, content-delivery scripts or embedded fonts without revisiting the privacy and CSP documentation.
