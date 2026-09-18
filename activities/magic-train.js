(function () {
  'use strict';

  const stops = [
    {
      name: 'Ocean Observatory',
      observation: 'Blue light moves across a quiet underwater station.',
      prompts: {
        A1: 'What can you see? Name two details and listen for one detail from a partner.',
        A2: 'What might happen next? Give one clue from the scene.',
        B1: 'Which explanation best fits this place? Compare two possibilities and justify your choice.'
      },
      guide: 'Invite an observation first, then an inference. Ask: “Which detail made you think that?”'
    },
    {
      name: 'Dinosaur Footprints',
      observation: 'Large tracks cross dry ground beside three dark rocks.',
      prompts: {
        A1: 'Describe the tracks. Are they big or small? Where do they go?',
        A2: 'Who or what made the tracks? Use because in your answer.',
        B1: 'Build a claim from the evidence, then identify one detail that could challenge it.'
      },
      guide: 'Separate what learners can observe from what they infer. Welcome more than one plausible claim.'
    },
    {
      name: 'Sky Garden',
      observation: 'A bright garden appears above the clouds.',
      prompts: {
        A1: 'Choose one thing for the garden. Tell your partner where it goes.',
        A2: 'Design one rule for the garden and explain why it matters.',
        B1: 'Agree on a plan that balances imagination, safety and access. Summarise the group decision.'
      },
      guide: 'Listen for turn-taking, questions, reasons and a final synthesis. The teacher—not software—decides when to move on.'
    }
  ];

  window.OpenOracy.register({
    id: 'magic-train',
    title: 'Magic Train',
    summary: 'A teacher-led journey through three visual prompts for observation, inference, reasoning and collaborative decision-making.',
    mount(host, api) {
      let index = -1;
      host.innerHTML = '<div class="activity-grid">' +
        '<section class="stage train-stage" aria-label="Magic Train activity">' +
          '<div class="train-view" data-stop="0"><div class="train-scene" aria-hidden="true"></div><div class="train-label"><span class="pill">Teacher-controlled journey</span><h2 data-stop-name>Ready to depart</h2><p data-observation>Choose a language level, then start the journey.</p></div></div>' +
          '<div class="train-console"><div class="train-prompt"><b data-prompt-label>Speaking prompt</b><p data-prompt>Every stop follows the same rhythm: notice, speak, listen and give a reason.</p></div><div class="row"><button class="button primary" type="button" data-next>Start journey</button><button class="button secondary" type="button" data-guide disabled>Show teacher guide</button></div><div class="teacher-guide" data-guide-text hidden></div></div>' +
        '</section>' +
        '<aside class="control-panel"><h2>Teacher controls</h2><div class="stack">' +
          '<label class="field"><span>Language level</span><select class="select" data-level><option>A1</option><option>A2</option><option>B1</option></select></label>' +
          '<div><span class="hint">Journey progress</span><progress class="progress" value="0" max="100" data-progress aria-label="Journey progress"></progress><p class="hint" data-progress-text>Not started</p></div>' +
          '<p class="hint">The scene does not listen, score, rank or decide whether an answer is correct. Learners respond to one another; the teacher chooses when the class is ready for the next stop.</p>' +
          '<button class="button" type="button" data-reset disabled>Reset journey</button>' +
        '</div></aside>' +
      '</div>';

      const view = host.querySelector('.train-view');
      const name = host.querySelector('[data-stop-name]');
      const observation = host.querySelector('[data-observation]');
      const prompt = host.querySelector('[data-prompt]');
      const next = host.querySelector('[data-next]');
      const guide = host.querySelector('[data-guide]');
      const guideText = host.querySelector('[data-guide-text]');
      const reset = host.querySelector('[data-reset]');
      const level = host.querySelector('[data-level]');
      const progress = host.querySelector('[data-progress]');
      const progressText = host.querySelector('[data-progress-text]');

      function render() {
        const started = index >= 0;
        const stop = started ? stops[index] : null;
        view.dataset.stop = String(Math.max(0, index));
        name.textContent = stop ? stop.name : 'Ready to depart';
        observation.textContent = stop ? stop.observation : 'Choose a language level, then start the journey.';
        prompt.textContent = stop ? stop.prompts[level.value] : 'Every stop follows the same rhythm: notice, speak, listen and give a reason.';
        next.textContent = !started ? 'Start journey' : index === stops.length - 1 ? 'Finish journey' : 'Next stop';
        next.disabled = index === stops.length;
        guide.disabled = !started || index === stops.length;
        reset.disabled = !started;
        guideText.hidden = true;
        guide.setAttribute('aria-expanded', 'false');
        guide.textContent = 'Show teacher guide';
        const completed = index === stops.length;
        progress.value = completed ? 100 : started ? ((index + 1) / stops.length) * 100 : 0;
        progressText.textContent = completed ? 'Journey complete' : started ? 'Stop ' + (index + 1) + ' of ' + stops.length : 'Not started';
        if (completed) {
          name.textContent = 'Journey complete';
          observation.textContent = 'Ask one learner to summarise an idea they heard from someone else.';
          prompt.textContent = 'What changed or became clearer after listening to the group?';
          api.announce('Magic Train journey complete.');
        }
      }

      api.on(next, 'click', function () {
        if (index < stops.length) index += 1;
        render();
        if (index < stops.length) api.announce('Stop ' + (index + 1) + ': ' + stops[index].name);
      });
      api.on(level, 'change', render);
      api.on(guide, 'click', function () {
        const isOpen = !guideText.hidden;
        guideText.hidden = isOpen;
        guide.setAttribute('aria-expanded', String(!isOpen));
        guide.textContent = isOpen ? 'Show teacher guide' : 'Hide teacher guide';
        if (!isOpen) guideText.textContent = stops[index].guide;
      });
      api.on(reset, 'click', function () { index = -1; render(); api.announce('Journey reset.'); });
      render();
    }
  });
}());
