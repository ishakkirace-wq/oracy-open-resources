(function () {
  'use strict';

  const captions = {
    sleep: ['RESTING', 'Keep the dragon dreaming.'],
    stir: ['STIRRING', 'A little quieter…'],
    drowsy: ['LISTENING IN ITS SLEEP', 'There is still time to settle.'],
    resettle: ['SETTLING DOWN', 'Quiet voices. Sweet dreams.'],
    wake: ['WAKING UP', 'Bring the shared voice level down.'],
    awake: ['AWAKE', 'A calm classroom will help it rest.'],
    return: ['BACK TO SLEEP', 'The cave is peaceful again.']
  };

  window.OpenOracy.register({
    id: 'sleeping-dragon',
    title: 'Sleeping Dragon',
    summary: 'A shared, local-only classroom sound cue. Relative microphone level can move a CSS dragon through calm, stirring and waking states; preview buttons work without a microphone.',
    mount(host, api) {
      const core = window.SleepingDragonCore;
      const machine = new core.DragonStateMachine('sleep');
      const counter = new core.NoiseCounter();
      let previous = null;
      let transitionTimer = 0;
      let stream = null;
      let audioContext = null;
      let source = null;
      let analyser = null;
      let samples = null;
      let frame = 0;
      let live = false;
      let pending = false;
      let level = 0;
      let lastSample = 0;

      host.innerHTML = '<div class="activity-grid">' +
        '<section class="stage dragon-stage" aria-label="Sleeping Dragon activity">' +
          '<div class="dragon-cave"><div class="dragon-moon" aria-hidden="true"></div><div class="dragon" data-dragon-state="sleep" aria-hidden="true"><span class="dragon-tail"></span><span class="dragon-body"></span><span class="dragon-wing"></span><span class="dragon-head"><i class="dragon-eye"></i></span><span class="dragon-breath"></span></div><div class="dragon-copy"><span class="pill" data-kicker>RESTING</span><h2 data-title>Keep the dragon dreaming.</h2><p data-mode>Preview · microphone off</p></div></div>' +
          '<div class="dragon-console"><label for="dragon-meter">Relative classroom sound</label><progress id="dragon-meter" class="dragon-meter" value="0" max="100" data-meter></progress><div class="row"><span class="dragon-level" data-level>0 / 100</span><span class="dragon-counter" data-counter>To stir: 0 / 3</span></div><p class="dragon-notice" data-notice>Use the preview controls or start local microphone listening.</p></div>' +
        '</section>' +
        '<aside class="control-panel"><h2>Teacher controls</h2><div class="stack">' +
          '<button class="button primary" type="button" data-mic>Start local listening</button>' +
          '<div><span class="hint">Microphone-free preview</span><div class="row"><button class="button" type="button" data-preview="0">Quiet</button><button class="button" type="button" data-preview="1">Medium</button><button class="button" type="button" data-preview="2">Loud</button></div></div>' +
          '<label class="field"><span>Crossings to stir</span><select class="select" data-stir>' + options(3) + '</select></label>' +
          '<label class="field"><span>Crossings to wake</span><select class="select" data-wake>' + options(3) + '</select></label>' +
          '<label class="field"><span>Medium threshold · relative, not dB</span><input class="input" type="range" min="10" max="65" value="28" data-medium></label>' +
          '<label class="field"><span>High threshold · relative, not dB</span><input class="input" type="range" min="30" max="95" value="55" data-high></label>' +
          '<p class="hint">The microphone signal is reduced to a relative level on this device. Audio is not recorded, transcribed, identified or uploaded. The measure is not calibrated in decibels and does not assess individual children.</p>' +
        '</div></aside>' +
      '</div>';

      function options(selected) {
        return Array.from({ length: 10 }, function (_, index) {
          const value = index + 1;
          return '<option value="' + value + '"' + (value === selected ? ' selected' : '') + '>' + value + '</option>';
        }).join('');
      }

      const dragon = host.querySelector('[data-dragon-state]');
      const kicker = host.querySelector('[data-kicker]');
      const title = host.querySelector('[data-title]');
      const mode = host.querySelector('[data-mode]');
      const meter = host.querySelector('[data-meter]');
      const levelLabel = host.querySelector('[data-level]');
      const counterLabel = host.querySelector('[data-counter]');
      const notice = host.querySelector('[data-notice]');
      const micButton = host.querySelector('[data-mic]');
      const stirLimit = host.querySelector('[data-stir]');
      const wakeLimit = host.querySelector('[data-wake]');
      const mediumInput = host.querySelector('[data-medium]');
      const highInput = host.querySelector('[data-high]');

      function thresholds() {
        let medium = Number(mediumInput.value);
        let high = Number(highInput.value);
        if (high < medium + 10) {
          high = Math.min(95, medium + 10);
          if (high < medium + 10) medium = high - 10;
          mediumInput.value = String(medium);
          highInput.value = String(high);
        }
        return { medium, high };
      }

      function updateCounter() {
        const stage = counter.stage;
        counterLabel.textContent = ['wake', 'return', 'resettle'].includes(machine.current)
          ? (machine.current === 'wake' ? 'Dragon awake' : 'Returning to calm')
          : (stage === 0 ? 'To stir: ' : 'To wake: ') + counter.count + ' / ' + counter.limits[stage];
      }

      function updateMeter(value, label) {
        const normalised = Math.max(0, Math.min(100, Number(value) || 0));
        meter.value = normalised;
        levelLabel.textContent = label || Math.round(normalised) + ' / 100';
      }

      function renderState() {
        const state = machine.current;
        dragon.dataset.dragonState = state;
        kicker.textContent = captions[state][0];
        title.textContent = captions[state][1];
        if (state === 'stir' && previous !== 'stir') counter.reset(1, false);
        if (state === 'return') {
          machine.setTarget(0);
          counter.reset(0, false);
        }
        if (state === 'sleep' && previous !== 'sleep') counter.reset(0, false);
        previous = state;
        updateCounter();
      }

      function scheduleTransition() {
        window.clearTimeout(transitionTimer);
        const next = core.nextDragonState(machine.current, machine.target);
        if (next === machine.current) return;
        transitionTimer = window.setTimeout(function () {
          if (!api.isLive()) return;
          machine.advance();
          renderState();
          scheduleTransition();
        }, 1100);
      }

      function setTarget(target) {
        machine.setTarget(target);
        scheduleTransition();
      }

      async function stopListening(message) {
        live = false;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        if (stream) stream.getTracks().forEach(function (track) { track.stop(); });
        stream = null;
        if (source) source.disconnect();
        source = null;
        analyser = null;
        samples = null;
        if (audioContext) {
          const closing = audioContext;
          audioContext = null;
          try { await closing.close(); } catch (_) { /* Already closed. */ }
        }
        level = 0;
        updateMeter(0, 'Microphone off');
        micButton.textContent = 'Start local listening';
        mode.textContent = 'Preview · microphone off';
        counter.reset(0);
        setTarget(0);
        updateCounter();
        if (message) notice.textContent = message;
      }

      function sample(time) {
        if (!live || !analyser || !api.isLive()) return;
        if (time - lastSample >= 45) {
          lastSample = time;
          analyser.getFloatTimeDomainData(samples);
          let sum = 0;
          for (const sample of samples) sum += sample * sample;
          const rms = Math.sqrt(sum / samples.length);
          const relative = Math.max(0, Math.min(100, (20 * Math.log10(Math.max(rms * 3, 0.000001)) + 65) / 0.65));
          level = level * .65 + relative * .35;
          updateMeter(level);
          const limits = thresholds();
          const stage = machine.current === 'sleep' ? 0 : 1;
          if (!['sleep', 'stir', 'drowsy'].includes(machine.current)) {
            counter.hold();
          } else {
            if (counter.stage !== stage) counter.reset(stage, false);
            const next = counter.sample(time, level, limits.medium, limits.high, machine.current !== 'stir' && machine.target === stage);
            if (next !== null && next !== machine.target) setTarget(next);
            updateCounter();
          }
        }
        frame = window.requestAnimationFrame(sample);
      }

      api.on(micButton, 'click', async function () {
        if (pending) return;
        if (live) { await stopListening('Listening paused. The dragon will return to sleep.'); return; }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          notice.textContent = 'Microphone access needs localhost or HTTPS. The preview buttons remain available.';
          return;
        }
        pending = true;
        micButton.disabled = true;
        micButton.textContent = 'Opening microphone…';
        try {
          const incoming = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false }, video: false });
          if (!api.isLive()) { incoming.getTracks().forEach(function (track) { track.stop(); }); return; }
          stream = incoming;
          const Audio = window.AudioContext || window.webkitAudioContext;
          audioContext = new Audio();
          await audioContext.resume();
          source = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
          samples = new Float32Array(analyser.fftSize);
          live = true;
          level = 0;
          counter.reset(0);
          setTarget(0);
          micButton.textContent = 'Stop local listening';
          mode.textContent = 'Listening live · processed locally';
          notice.textContent = 'Use the thresholds for this room. No audio leaves the device.';
          frame = window.requestAnimationFrame(sample);
          stream.getAudioTracks()[0].addEventListener('ended', function () {
            if (live) stopListening('Microphone disconnected. Preview controls remain available.');
          }, { once: true });
        } catch (error) {
          await stopListening('Microphone could not start. Check browser permission or use the preview controls.');
        } finally {
          pending = false;
          if (api.isLive()) micButton.disabled = false;
        }
      });

      host.querySelectorAll('[data-preview]').forEach(function (button) {
        api.on(button, 'click', async function () {
          if (live) await stopListening();
          const target = Number(button.dataset.preview);
          mode.textContent = 'Preview · microphone off';
          updateMeter([12, 48, 84][target], 'Preview level');
          notice.textContent = 'State changes finish their current movement before following the new target.';
          setTarget(target);
        });
      });
      api.on(stirLimit, 'change', function () { counter.limits[0] = Number(stirLimit.value); counter.reset(counter.stage); updateCounter(); });
      api.on(wakeLimit, 'change', function () { counter.limits[1] = Number(wakeLimit.value); counter.reset(counter.stage); updateCounter(); });
      api.on(mediumInput, 'input', function () { thresholds(); counter.reset(counter.stage); updateCounter(); });
      api.on(highInput, 'input', function () { thresholds(); counter.reset(counter.stage); updateCounter(); });
      api.on(document, 'visibilitychange', function () { if (document.hidden && live) stopListening('Listening paused while the page was hidden.'); });
      api.addCleanup(function () {
        window.clearTimeout(transitionTimer);
        if (frame) window.cancelAnimationFrame(frame);
        if (stream) stream.getTracks().forEach(function (track) { track.stop(); });
        if (source) source.disconnect();
        if (audioContext) audioContext.close().catch(function () {});
      });
      renderState();
      updateMeter(0, 'Microphone off');
    }
  });
}());

