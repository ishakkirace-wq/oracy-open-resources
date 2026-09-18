# Proposed AI component — not built

There is no model, AI API, prompt pipeline or inference code in this repository. The following is a constrained design direction for work that may be undertaken if funded; it is **not implemented**.

## Proposed purpose

An optional teacher-facing authoring assistant could help an educator draft differentiated discussion prompts, listening questions and sentence frames from teacher-supplied lesson goals. Its output would remain a draft until the teacher reviews, edits and explicitly publishes it.

## Proposed boundaries

- No automatic learner score, CEFR judgement or high-stakes recommendation.
- No emotion, identity, behaviour or speaker inference.
- No passive classroom recording.
- No model training on learner content by default.
- Data minimisation and clear deletion controls.
- Visible provenance and uncertainty information.
- Non-AI templates remain available offline.
- Human review is mandatory before generated content reaches learners.

## Evidence required before deployment

The team would need to document the chosen model and hosting, data flows, retention, subprocessors, safety tests, language coverage, bias and accessibility testing, failure modes, cost and low-connectivity fallback. The feature should not enter a school pilot until privacy, safeguarding and security review are complete.

