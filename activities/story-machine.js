(function () {
  'use strict';

  const banks = {
    character: ['a careful inventor', 'a new student', 'a tired astronaut', 'a brave librarian', 'two unlikely friends', 'a young reporter'],
    place: ['an empty museum', 'a floating market', 'the last train platform', 'a garden above the clouds', 'a lighthouse during a storm', 'a school after sunset'],
    object: ['a key with no lock', 'a message in a bottle', 'a broken compass', 'a photograph from tomorrow', 'a silent music box', 'a map with one moving line'],
    twist: ['The person everyone trusted changes their mind.', 'Time begins to move backwards.', 'The object belongs to someone in the group.', 'A small detail from the beginning becomes important.', 'The problem cannot be solved alone.', 'The apparent ending is actually a new beginning.']
  };

  function choose(list) {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return list[value[0] % list.length];
    }
    return list[Math.floor(Math.random() * list.length)];
  }

  window.OpenOracy.register({
    id: 'story-machine',
    title: 'Story Machine',
    summary: 'A shared story builder for narrative structure, turn-taking, active listening and coherent contributions.',
    mount(host, api) {
      let cards = {};
      let lines = [];
      let twist = '';

      host.innerHTML = '<div class="activity-grid">' +
        '<section class="stage story-stage" aria-label="Story Machine activity"><div class="story-sparks"><article><span>Character</span><b data-character></b></article><article><span>Place</span><b data-place></b></article><article><span>Object</span><b data-object></b></article></div><div class="story-twist" data-twist hidden></div><ol class="story-lines" data-lines><li class="story-empty">The story is waiting for its first sentence.</li></ol><div class="story-entry"><label for="story-line">Add one sentence that connects to what came before</label><div class="row"><input id="story-line" class="input" maxlength="220" data-input><button class="button primary" type="button" data-add>Add sentence</button></div></div></section>' +
        '<aside class="control-panel"><h2>Teacher controls</h2><div class="stack"><button class="button primary" type="button" data-shuffle>Shuffle story sparks</button><button class="button secondary" type="button" data-twist-button>Reveal a twist</button><button class="button" type="button" data-undo disabled>Undo last sentence</button><button class="button danger" type="button" data-clear disabled>Clear story</button><p class="hint">Each learner adds one sentence. Before adding, they briefly connect it to a detail contributed by someone else. The software stores nothing and does not judge story quality.</p></div></aside>' +
      '</div>';

      const list = host.querySelector('[data-lines]');
      const input = host.querySelector('[data-input]');
      const undo = host.querySelector('[data-undo]');
      const clear = host.querySelector('[data-clear]');
      const twistBox = host.querySelector('[data-twist]');

      function shuffle() {
        cards = { character: choose(banks.character), place: choose(banks.place), object: choose(banks.object) };
        host.querySelector('[data-character]').textContent = cards.character;
        host.querySelector('[data-place]').textContent = cards.place;
        host.querySelector('[data-object]').textContent = cards.object;
        twist = '';
        twistBox.hidden = true;
        host.querySelector('[data-twist-button]').textContent = 'Reveal a twist';
        api.announce('New character, place and object selected.');
      }

      function renderLines() {
        list.replaceChildren();
        if (!lines.length) {
          const empty = document.createElement('li');
          empty.className = 'story-empty';
          empty.textContent = 'The story is waiting for its first sentence.';
          list.append(empty);
        } else {
          lines.forEach(function (line) { const item = document.createElement('li'); item.textContent = line; list.append(item); });
        }
        undo.disabled = !lines.length;
        clear.disabled = !lines.length;
      }

      function addLine() {
        const value = input.value.trim();
        if (!value) { api.announce('Write a sentence before adding it.'); input.focus(); return; }
        lines.push(value);
        input.value = '';
        renderLines();
        input.focus();
        api.announce('Sentence ' + lines.length + ' added.');
      }

      api.on(host.querySelector('[data-shuffle]'), 'click', shuffle);
      api.on(host.querySelector('[data-twist-button]'), 'click', function () {
        if (!twist) twist = choose(banks.twist);
        twistBox.textContent = 'TWIST · ' + twist;
        twistBox.hidden = !twistBox.hidden;
        host.querySelector('[data-twist-button]').textContent = twistBox.hidden ? 'Reveal the twist' : 'Hide the twist';
      });
      api.on(host.querySelector('[data-add]'), 'click', addLine);
      api.on(input, 'keydown', function (event) { if (event.key === 'Enter') { event.preventDefault(); addLine(); } });
      api.on(undo, 'click', function () { lines.pop(); renderLines(); api.announce('Last sentence removed.'); });
      api.on(clear, 'click', function () { lines = []; renderLines(); api.announce('Story cleared.'); });
      shuffle();
      renderLines();
    }
  });
}());

