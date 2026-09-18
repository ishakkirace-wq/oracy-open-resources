# Testing

## Automated repository checks

Run:

```sh
npm test
```

The dependency-free suite runs 29 checks: 21 adapted Sleeping Dragon tests for state transitions, sound-target handling, crossing thresholds, hysteresis, media exclusion, local microphone boundaries and privacy wording, plus eight repository syntax, scope, active-licence, Content Security Policy and truthful-AI checks.

## Browser smoke test

Serve the repository through localhost and verify:

1. The home page lists exactly Sleeping Dragon, Magic Train, Listening Detectives, Story Machine, Emotion Studio and Describe & Draw.
2. Back navigation destroys the current activity and returns home.
3. Sleeping Dragon's preview buttons move through complete logical states without a video; local listening asks permission only after a click, updates a relative meter and releases the stream when stopped or closed.
4. Magic Train changes language-level prompts, visits three stops, reveals teacher guidance and completes without automatic scoring.
5. Listening Detectives cycles through three cases, reveals/hides transcripts, toggles evidence checkboxes and shows teacher guidance. If no local English voice exists, the fallback message appears.
6. Story Machine shuffles three prompts, adds text safely, reveals a twist, undoes and clears.
7. Emotion Studio selects a phrase/intention, hides and reveals the intention, and runs the optional timer without listening or recording.
8. Describe & Draw changes source-coded scenes, hides/shows the reference, draws with mouse or touch, undoes, clears, compares and downloads a PNG.
9. Keyboard focus is visible and all buttons/selects are reachable.
10. At a narrow viewport, controls and activity content remain usable without horizontal scrolling.
11. The browser network panel shows no application requests after initial static files load.

## Limits

Automated and smoke tests do not establish pedagogical effectiveness, legal compliance or suitability for an unsupervised child-facing deployment.
