(function () {
  'use strict';

  const cases = [
    {
      title: 'The Changed Meeting Point',
      transcript: 'Mina said the science club would meet outside the library at three thirty, not beside the hall at three. She asked everyone to bring a notebook because the group would interview the gardener first.',
      question: 'What changed, and what should the group bring?',
      evidence: ['The meeting is outside the library.', 'The time is 3:30.', 'Everyone should bring a notebook.', 'The first interview is with the gardener.'],
      guide: 'A complete response identifies both changes—place and time—and the notebook. Strong explanations cite exact words from the message.'
    },
    {
      title: 'The Missing Model',
      transcript: 'Arda left the model bridge on the blue table after lunch. When he returned, the table was empty, but a roll of silver tape was beside the open window. The art group had moved its materials to the courtyard.',
      question: 'Which details matter, and what can we infer without claiming certainty?',
      evidence: ['The model was on the blue table.', 'The window was open.', 'Silver tape was left nearby.', 'The art group moved to the courtyard.'],
      guide: 'Learners should distinguish evidence from speculation. Several explanations remain possible; uncertainty is a legitimate conclusion.'
    },
    {
      title: 'The Late Delivery',
      transcript: 'The sports equipment will arrive on Thursday instead of Tuesday because the road near the school is closed. The teacher will borrow six cones from the primary building so Wednesday practice can still happen.',
      question: 'Why is the delivery late, and how will practice continue?',
      evidence: ['The road near the school is closed.', 'The delivery moves to Thursday.', 'The teacher will borrow six cones.', 'Wednesday practice will still happen.'],
      guide: 'Listen for causal language: because and so. Ask a learner to retell the message in chronological order.'
    }
  ];

  window.OpenOracy.register({
    id: 'listening-detectives',
    title: 'Listening Detectives',
    summary: 'Short local listening cases help learners identify detail, separate evidence from inference and explain what they heard.',
    mount(host, api) {
      let caseIndex = 0;
      let transcriptVisible = false;
      let speaking = null;

      host.innerHTML = '<div class="activity-grid">' +
        '<section class="stage detective-stage" aria-label="Listening Detectives activity"><div class="case-file">' +
          '<div class="case-title"><div><span class="pill">Case file <b data-case-number></b></span><h2 data-title></h2><p data-question></p></div></div>' +
          '<div class="audio-card"><div class="row"><button class="button primary" type="button" data-play>Play with a local device voice</button><button class="button secondary" type="button" data-transcript>Show transcript</button></div><p class="hint" data-voice-status>A teacher may also read the case aloud.</p><p data-transcript-text hidden></p></div>' +
          '<div class="evidence-card"><h3>Details learners may cite</h3><div class="evidence-options" data-evidence></div></div>' +
          '<div class="teacher-guide" data-guide hidden></div>' +
        '</div></section>' +
        '<aside class="control-panel"><h2>Teacher controls</h2><div class="stack">' +
          '<button class="button" type="button" data-reveal>Reveal discussion guide</button>' +
          '<button class="button secondary" type="button" data-next>Next case</button>' +
          '<p class="hint">The checkboxes organise evidence; they do not calculate a score. The local read-aloud button is used only when an installed English device voice is available. No recording or upload occurs.</p>' +
        '</div></aside>' +
      '</div>';

      const synth = window.speechSynthesis;
      const title = host.querySelector('[data-title]');
      const number = host.querySelector('[data-case-number]');
      const question = host.querySelector('[data-question]');
      const transcript = host.querySelector('[data-transcript-text]');
      const evidence = host.querySelector('[data-evidence]');
      const guide = host.querySelector('[data-guide]');
      const play = host.querySelector('[data-play]');
      const transcriptButton = host.querySelector('[data-transcript]');
      const reveal = host.querySelector('[data-reveal]');
      const next = host.querySelector('[data-next]');
      const voiceStatus = host.querySelector('[data-voice-status]');

      function stopVoice() {
        if (synth && speaking) synth.cancel();
        speaking = null;
        play.textContent = 'Play with a local device voice';
      }

      function render() {
        stopVoice();
        const current = cases[caseIndex];
        number.textContent = (caseIndex + 1) + ' / ' + cases.length;
        title.textContent = current.title;
        question.textContent = current.question;
        transcript.textContent = current.transcript;
        transcript.hidden = !transcriptVisible;
        transcriptButton.textContent = transcriptVisible ? 'Hide transcript' : 'Show transcript';
        guide.hidden = true;
        guide.textContent = current.guide;
        reveal.textContent = 'Reveal discussion guide';
        evidence.replaceChildren();
        current.evidence.forEach(function (detail, index) {
          const label = document.createElement('label');
          label.className = 'evidence-option';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.setAttribute('aria-label', 'Evidence detail ' + (index + 1));
          const span = document.createElement('span');
          span.textContent = detail;
          label.append(input, span);
          evidence.append(label);
        });
      }

      api.on(play, 'click', function () {
        if (!synth || !window.SpeechSynthesisUtterance) {
          voiceStatus.textContent = 'Read-aloud is unavailable. The teacher can read the transcript.';
          return;
        }
        if (speaking) { stopVoice(); voiceStatus.textContent = 'Read-aloud stopped.'; return; }
        const voices = synth.getVoices();
        const voice = voices.find(function (candidate) { return candidate.localService && /^en([-_]|$)/i.test(candidate.lang); });
        if (!voice) {
          voiceStatus.textContent = 'No installed local English voice was found. The teacher can read the transcript.';
          return;
        }
        speaking = new SpeechSynthesisUtterance(cases[caseIndex].transcript);
        speaking.voice = voice;
        speaking.lang = voice.lang;
        speaking.rate = .9;
        speaking.onend = function () { speaking = null; play.textContent = 'Play again'; voiceStatus.textContent = 'Finished. Discuss the evidence or replay.'; };
        speaking.onerror = function () { speaking = null; play.textContent = 'Play with a local device voice'; voiceStatus.textContent = 'Read-aloud could not finish. The teacher can read the transcript.'; };
        synth.speak(speaking);
        play.textContent = 'Stop read-aloud';
        voiceStatus.textContent = 'Reading with an installed device voice.';
      });
      api.on(transcriptButton, 'click', function () { transcriptVisible = !transcriptVisible; render(); });
      api.on(reveal, 'click', function () {
        guide.hidden = !guide.hidden;
        reveal.textContent = guide.hidden ? 'Reveal discussion guide' : 'Hide discussion guide';
      });
      api.on(next, 'click', function () {
        caseIndex = (caseIndex + 1) % cases.length;
        transcriptVisible = false;
        render();
        api.announce('Case ' + (caseIndex + 1) + ': ' + cases[caseIndex].title);
      });
      api.addCleanup(stopVoice);
      render();
    }
  });
}());

