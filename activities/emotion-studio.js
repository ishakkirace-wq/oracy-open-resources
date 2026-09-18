(function () {
  'use strict';

  const phrases = [
    'I did not expect to see you here.',
    'We should open the door together.',
    'That was the last piece.',
    'I think I know another way.',
    'The message arrived this morning.',
    'Please tell me what happened next.'
  ];
  const intentions = [
    ['curious', 'You genuinely want to understand more.'],
    ['worried', 'You need an answer because something may be wrong.'],
    ['excited', 'You have just discovered good news.'],
    ['calm and reassuring', 'You want the listener to feel safe.'],
    ['uncertain', 'You are not yet convinced by your own idea.'],
    ['proud', 'You want to share an achievement without boasting.']
  ];

  function random(list) { return list[Math.floor(Math.random() * list.length)]; }

  window.OpenOracy.register({
    id: 'emotion-studio',
    title: 'Emotion Studio',
    summary: 'Learners explore how intention, pace, stress and intonation can change the meaning of the same words—without automated emotion detection.',
    mount(host, api) {
      let phrase = '';
      let intention = null;
      let visible = true;
      let remaining = 30;
      let running = false;
      let last = performance.now();

      host.innerHTML = '<div class="activity-grid">' +
        '<section class="stage emotion-stage" aria-label="Emotion Studio activity"><div class="emotion-card"><span class="pill">Say the same words differently</span><blockquote data-phrase></blockquote><div class="emotion-direction" data-direction></div><p class="emotion-secret" data-secret>Show the intention only to the performer, then hide it before classmates listen.</p></div><div class="emotion-reflect"><b>Listeners discuss</b><p>Which vocal clues did you notice—pace, pause, volume, stress or intonation? What alternative interpretation is possible?</p></div></section>' +
        '<aside class="control-panel"><h2>Teacher controls</h2><div class="stack"><button class="button primary" type="button" data-new>New round</button><button class="button secondary" type="button" data-hide>Hide intention</button><div><span class="hint">Optional rehearsal timer</span><output class="emotion-time" data-time>0:30</output><div class="row"><button class="button" type="button" data-timer>Start</button><button class="button" type="button" data-reset>Reset</button></div></div><p class="hint">The class interprets a performance and explains its evidence. The software does not listen, record, detect emotion or mark an answer as correct.</p></div></aside>' +
      '</div>';

      const phraseNode = host.querySelector('[data-phrase]');
      const direction = host.querySelector('[data-direction]');
      const hide = host.querySelector('[data-hide]');
      const time = host.querySelector('[data-time]');
      const timerButton = host.querySelector('[data-timer]');

      function renderDirection() {
        direction.hidden = !visible;
        direction.textContent = visible ? intention[0].toUpperCase() + ' · ' + intention[1] : 'INTENTION HIDDEN · Listen for vocal clues.';
        direction.hidden = false;
        direction.classList.toggle('is-hidden', !visible);
        hide.textContent = visible ? 'Hide intention' : 'Show intention';
      }

      function newRound() {
        phrase = random(phrases);
        intention = random(intentions);
        visible = true;
        phraseNode.textContent = '“' + phrase + '”';
        renderDirection();
        api.announce('New phrase and intention selected.');
      }

      function renderTime() {
        const whole = Math.ceil(remaining);
        time.textContent = Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
        timerButton.textContent = running ? 'Pause' : remaining > 0 ? 'Start' : 'Start again';
      }

      api.on(host.querySelector('[data-new]'), 'click', newRound);
      api.on(hide, 'click', function () { visible = !visible; renderDirection(); });
      api.on(timerButton, 'click', function () { if (remaining <= 0) remaining = 30; running = !running; last = performance.now(); renderTime(); });
      api.on(host.querySelector('[data-reset]'), 'click', function () { running = false; remaining = 30; renderTime(); });
      api.on(document, 'visibilitychange', function () { if (document.hidden) running = false; last = performance.now(); renderTime(); });
      api.interval(function () {
        const now = performance.now();
        if (running) {
          remaining = Math.max(0, remaining - (now - last) / 1000);
          if (!remaining) { running = false; api.announce('Rehearsal time finished.'); }
          renderTime();
        }
        last = now;
      }, 200);
      newRound();
      renderTime();
    }
  });
}());

