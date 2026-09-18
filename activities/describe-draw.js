(function () {
  'use strict';

  const scenes = [
    {
      name: 'House and trees',
      prompt: 'Describe position, size, colour and shape. Do not name the whole picture.',
      svg: '<svg viewBox="0 0 800 520" role="img" aria-label="A purple house between two trees, with a sun in the upper-right corner"><rect width="800" height="520" fill="#dff4fb"/><circle cx="680" cy="90" r="52" fill="#f3c34e"/><rect y="360" width="800" height="160" fill="#8ccf9c"/><rect x="280" y="230" width="250" height="180" rx="8" fill="#9a73c4"/><path d="M245 245L405 120l160 125z" fill="#5a376d"/><rect x="375" y="315" width="60" height="95" fill="#f5dfb1"/><rect x="305" y="270" width="55" height="50" fill="#b9e8f2"/><rect x="450" y="270" width="55" height="50" fill="#b9e8f2"/><rect x="115" y="245" width="34" height="150" fill="#725137"/><circle cx="132" cy="210" r="82" fill="#3c946e"/><rect x="635" y="260" width="30" height="135" fill="#725137"/><circle cx="650" cy="230" r="70" fill="#4aa779"/></svg>'
    },
    {
      name: 'Shapes on shelves',
      prompt: 'Use precise relational language: above, below, between, beside, left and right.',
      svg: '<svg viewBox="0 0 800 520" role="img" aria-label="Three shelves holding coloured geometric shapes"><rect width="800" height="520" fill="#fff8e4"/><rect x="90" y="150" width="620" height="24" rx="8" fill="#6f4d3b"/><rect x="90" y="330" width="620" height="24" rx="8" fill="#6f4d3b"/><circle cx="185" cy="95" r="48" fill="#dc6968"/><rect x="335" y="54" width="96" height="96" rx="12" fill="#5d35a7"/><path d="M575 145l-60-104h120z" fill="#168c82"/><path d="M180 320l-68-118h136z" fill="#ebb842"/><circle cx="390" cy="270" r="52" fill="#4787d3"/><rect x="555" y="214" width="105" height="105" rx="52" fill="#e58cad"/></svg>'
    },
    {
      name: 'Park route',
      prompt: 'Give a route using sequence words. The listener may ask clarification questions.',
      svg: '<svg viewBox="0 0 800 520" role="img" aria-label="A winding park path from a gate to a fountain, passing a bench and three trees"><rect width="800" height="520" fill="#dff3d7"/><path d="M80 520c10-120 230-110 210-225S500 225 515 120 710 45 780 20" fill="none" stroke="#e9c891" stroke-width="88"/><rect x="40" y="420" width="160" height="24" rx="5" fill="#744f36"/><rect x="58" y="445" width="18" height="50" fill="#744f36"/><rect x="164" y="445" width="18" height="50" fill="#744f36"/><circle cx="570" cy="325" r="58" fill="#91d6e4" stroke="#367c96" stroke-width="14"/><circle cx="570" cy="325" r="13" fill="#fff"/><g fill="#3d966d"><circle cx="160" cy="170" r="64"/><circle cx="380" cy="105" r="70"/><circle cx="690" cy="205" r="66"/></g><g fill="#76523b"><rect x="146" y="210" width="28" height="95"/><rect x="366" y="150" width="28" height="100"/><rect x="676" y="245" width="28" height="90"/></g><path d="M48 485v-130M208 485v-130M48 355h160" stroke="#5a376d" stroke-width="18"/></svg>'
    }
  ];

  window.OpenOracy.register({
    id: 'describe-draw',
    title: 'Describe & Draw',
    summary: 'One learner describes a reference while a partner draws, asks for clarification and compares the result.',
    mount(host, api) {
      let sceneIndex = 0;
      let hidden = false;
      let compare = false;
      let colour = '#2b2440';
      let width = 6;
      let activePointer = null;
      let current = null;
      let strokes = [];

      host.innerHTML = '<div class="activity-grid">' +
        '<section class="stage draw-stage" aria-label="Describe and Draw activity">' +
          '<div class="draw-toolbar"><label>Pen <input type="color" value="#2b2440" data-colour></label><label>Size <input type="range" min="2" max="24" value="6" data-width></label><button class="button" type="button" data-undo disabled>Undo</button><button class="button danger" type="button" data-clear disabled>Clear</button></div>' +
          '<div class="draw-workspace"><section class="reference-pane"><div class="pane-title"><span>Speaker reference</span><button class="button secondary" type="button" data-hide>Hide picture</button></div><div class="reference-art" data-reference></div></section><section class="canvas-pane"><div class="pane-title"><span>Listener drawing</span><span>Touch · pen · mouse</span></div><div class="canvas-wrap"><canvas width="800" height="520" data-canvas tabindex="0" aria-label="Drawing canvas"></canvas></div></section></div>' +
          '<p class="draw-prompt" data-prompt></p>' +
        '</section>' +
        '<aside class="control-panel"><h2>Teacher controls</h2><div class="stack">' +
          '<label class="field"><span>Reference scene</span><select class="select" data-scene></select></label>' +
          '<button class="button primary" type="button" data-compare>Compare pictures</button>' +
          '<button class="button" type="button" data-save>Save drawing as PNG</button>' +
          '<p class="hint">Place the reference out of the listener’s sight. Encourage clarification questions, positional language and a second attempt after comparison. The drawing stays in this browser unless the user saves it.</p>' +
        '</div></aside>' +
      '</div>';

      const canvas = host.querySelector('[data-canvas]');
      const context = canvas.getContext('2d');
      const reference = host.querySelector('[data-reference]');
      const selector = host.querySelector('[data-scene]');
      const prompt = host.querySelector('[data-prompt]');
      const hideButton = host.querySelector('[data-hide]');
      const compareButton = host.querySelector('[data-compare]');
      const undoButton = host.querySelector('[data-undo]');
      const clearButton = host.querySelector('[data-clear]');
      const workspace = host.querySelector('.draw-workspace');

      scenes.forEach(function (scene, index) {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = scene.name;
        selector.append(option);
      });

      function drawStroke(stroke) {
        if (!stroke.points.length) return;
        context.save();
        context.strokeStyle = stroke.colour;
        context.fillStyle = stroke.colour;
        context.lineWidth = stroke.width;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.beginPath();
        context.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach(function (point) { context.lineTo(point.x, point.y); });
        if (stroke.points.length === 1) context.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
        stroke.points.length === 1 ? context.fill() : context.stroke();
        context.restore();
      }

      function redraw() {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        strokes.forEach(drawStroke);
        if (current) drawStroke(current);
        undoButton.disabled = strokes.length === 0;
        clearButton.disabled = strokes.length === 0;
      }

      function point(event) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) / rect.width * canvas.width,
          y: (event.clientY - rect.top) / rect.height * canvas.height
        };
      }

      function finish() {
        if (current && current.points.length) strokes.push(current);
        current = null;
        if (activePointer !== null && canvas.hasPointerCapture(activePointer)) canvas.releasePointerCapture(activePointer);
        activePointer = null;
        redraw();
      }

      function renderReference() {
        const scene = scenes[sceneIndex];
        prompt.textContent = scene.prompt;
        reference.classList.toggle('is-hidden', hidden);
        if (hidden) reference.innerHTML = '<div class="reference-cover"><b>Picture hidden</b><p>Listen carefully. Ask for a detail when the description is unclear.</p></div>';
        else reference.innerHTML = scene.svg;
        hideButton.textContent = hidden ? 'Show picture' : 'Hide picture';
        hideButton.setAttribute('aria-pressed', String(hidden));
      }

      api.on(canvas, 'pointerdown', function (event) {
        if (activePointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
        event.preventDefault();
        activePointer = event.pointerId;
        canvas.setPointerCapture(activePointer);
        current = { colour, width, points: [point(event)] };
        redraw();
      });
      api.on(canvas, 'pointermove', function (event) {
        if (event.pointerId !== activePointer || !current) return;
        event.preventDefault();
        current.points.push(point(event));
        redraw();
      });
      api.on(canvas, 'pointerup', function (event) { if (event.pointerId === activePointer) { current.points.push(point(event)); finish(); } });
      api.on(canvas, 'pointercancel', finish);
      api.on(host.querySelector('[data-colour]'), 'input', function (event) { colour = event.target.value; });
      api.on(host.querySelector('[data-width]'), 'input', function (event) { width = Number(event.target.value); });
      api.on(undoButton, 'click', function () { strokes.pop(); redraw(); api.announce('Last stroke removed.'); });
      api.on(clearButton, 'click', function () { strokes = []; redraw(); api.announce('Canvas cleared.'); });
      api.on(hideButton, 'click', function () { hidden = !hidden; compare = false; workspace.classList.remove('compare-mode'); renderReference(); });
      api.on(selector, 'change', function () { sceneIndex = Number(selector.value); hidden = false; compare = false; workspace.classList.remove('compare-mode'); renderReference(); });
      api.on(compareButton, 'click', function () {
        compare = !compare;
        hidden = false;
        workspace.classList.toggle('compare-mode', compare);
        compareButton.textContent = compare ? 'Continue practising' : 'Compare pictures';
        renderReference();
        api.announce(compare ? 'Comparison view opened.' : 'Practice view restored.');
      });
      api.on(host.querySelector('[data-save]'), 'click', function () {
        canvas.toBlob(function (blob) {
          if (!blob || !api.isLive()) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'describe-and-draw.png';
          link.click();
          api.timeout(function () { URL.revokeObjectURL(url); }, 2000);
          api.announce('Drawing prepared for download.');
        }, 'image/png');
      });
      redraw();
      renderReference();
    }
  });
}());

