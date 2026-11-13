const $ = (selector) => document.querySelector(selector);
const error = $('#error');
let credentials = null;
let state = null;
let selectedToken = null;
let refreshing = false;
let renderedTokens = '';
let renderedCharacters = '';
const dirtyForms = new Set();
for (const form of ['#notes-form', '#private-form', '#voice-form']) {
  $(form).addEventListener('input', () => dirtyForms.add(form));
}

function showError(message) {
  error.textContent = message;
  error.hidden = false;
}

function id() {
  return crypto.randomUUID();
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (credentials) headers.Authorization = `Bearer ${credentials.key}`;
  const response = await fetch(path, { ...options, headers, cache: 'no-store' });
  if (!response.ok) {
    let message = `Request failed (HTTP ${response.status}).`;
    const body = await response.json().catch(() => null);
    if (typeof body?.detail === 'string') message = body.detail;
    throw new Error(message);
  }
  return response.json();
}

function roomUrl(path = '') {
  return `/api/rooms/${encodeURIComponent(credentials.room)}${path}`;
}

async function mutate(path, method, data) {
  error.hidden = true;
  try {
    await request(roomUrl(path), { method, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
    await refresh();
    return true;
  } catch (problem) {
    showError(problem.message);
    return false;
  }
}

function node(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function button(text, handler, className = '') {
  const element = node('button', text, className);
  element.type = 'button';
  element.addEventListener('click', handler);
  return element;
}

function linkFor(room, key) {
  return `${location.origin}/#${encodeURIComponent(room)}:${encodeURIComponent(key)}`;
}

function showRoom() {
  $('#welcome').hidden = true;
  $('#room').hidden = false;
  $('#leave').hidden = false;
}

async function refresh() {
  if (!credentials || refreshing) return;
  refreshing = true;
  try {
    state = await request(roomUrl());
    $('#room-name').textContent = state.name;
    $('#role').textContent = state.role === 'gm' ? 'Game master' : 'Player';
    const gm = state.role === 'gm';
    $('#gm-tools').hidden = !gm;
    $('#notes-form').hidden = !gm;
    $('#notes').textContent = state.notes;
    const voice = $('#voice-link');
    voice.hidden = !state.voice;
    if (state.voice) voice.href = state.voice;
    if (!dirtyForms.has('#notes-form')) $('#notes-form').elements.text.value = state.notes;
    if (!dirtyForms.has('#private-form')) $('#private-form').elements.text.value = state.private_notes || '';
    if (!dirtyForms.has('#voice-form')) $('#voice-form').elements.url.value = state.voice;
    const tokenSnapshot = JSON.stringify([state.tokens, gm, selectedToken]);
    if (renderedTokens !== tokenSnapshot) {
      renderGrid(gm);
      renderedTokens = tokenSnapshot;
    }
    const characterSnapshot = JSON.stringify([state.characters, gm]);
    if (renderedCharacters !== characterSnapshot) {
      renderCharacters(gm);
      renderedCharacters = characterSnapshot;
    }
    $('#rolls').replaceChildren(...state.rolls.map((roll) =>
      node('li', `${roll.player}: ${roll.dice.length}d${roll.sides} [${roll.dice.join(', ')}] ${roll.modifier >= 0 ? '+' : ''}${roll.modifier} = ${roll.total}`)));
  } catch (problem) {
    showError(problem.message);
  } finally {
    refreshing = false;
  }
}

function renderGrid(gm) {
  const grid = $('#grid');
  grid.replaceChildren();
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const occupants = state.tokens.filter((token) => token.x === x && token.y === y);
      const square = button(occupants.map((token) => token.name.slice(0, 2)).join(' '), async () => {
        if (!selectedToken) { showError('Select a token first.'); return; }
        const token = state.tokens.find((item) => item.id === selectedToken);
        if (!token) { selectedToken = null; showError('That token no longer exists.'); return; }
        await mutate('/tokens', 'PUT', { ...token, x, y });
      }, occupants.length ? 'occupied' : '');
      square.setAttribute('aria-label', `Square ${x + 1}, ${y + 1}${occupants.length ? ': ' + occupants.map((token) => token.name).join(', ') : ''}`);
      grid.append(square);
    }
  }
  const list = $('#tokens');
  list.replaceChildren();
  for (const token of state.tokens) {
    const row = node('div', '', 'item');
    row.append(button(`${token.name} (${token.x + 1}, ${token.y + 1})`, () => {
      selectedToken = token.id;
      renderGrid(gm);
      renderedTokens = JSON.stringify([state.tokens, gm, selectedToken]);
    }, selectedToken === token.id ? 'selected' : 'secondary'));
    if (gm) row.append(button('Remove', () => mutate(`/tokens/${encodeURIComponent(token.id)}`, 'DELETE'), 'secondary'));
    list.append(row);
  }
}

function renderCharacters(gm) {
  const list = $('#characters');
  list.replaceChildren();
  for (const character of [...state.characters].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name))) {
    const row = node('div', '', 'item');
    row.append(node('span', `${character.initiative}: ${character.name} · HP ${character.hp} · ${character.details}`));
    row.append(button('Edit', () => {
      const form = $('#character-form');
      for (const field of ['id', 'name', 'details', 'hp', 'initiative']) form.elements[field].value = character[field];
      form.elements.name.focus();
    }, 'secondary'));
    if (gm) row.append(button('Remove', () => mutate(`/characters/${encodeURIComponent(character.id)}`, 'DELETE'), 'secondary'));
    list.append(row);
  }
}

$('#create').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const room = await request('/api/rooms', { method: 'POST', body: JSON.stringify({ name: event.target.elements.name.value }) });
    credentials = { room: room.room_id, key: room.gm_key };
    sessionStorage.setItem('adventure-table-room', JSON.stringify(credentials));
    $('#gm-link').value = linkFor(room.room_id, room.gm_key);
    $('#player-link').value = linkFor(room.room_id, room.player_key);
    $('#invites').hidden = false;
    showRoom();
    await refresh();
  } catch (problem) { showError(problem.message); }
});

$('#dismiss-invites').addEventListener('click', () => { $('#invites').hidden = true; });
$('#leave').addEventListener('click', () => { sessionStorage.removeItem('adventure-table-room'); location.replace('/'); });
$('#token-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (await mutate('/tokens', 'PUT', { id: id(), name: event.target.elements.name.value, x: 0, y: 0 })) event.target.reset();
});
$('#character-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const f = event.target.elements;
  if (await mutate('/characters', 'PUT', { id: f.id.value || id(), name: f.name.value, details: f.details.value, hp: Number(f.hp.value), initiative: Number(f.initiative.value) })) event.target.reset();
});
$('#clear-character').addEventListener('click', () => $('#character-form').reset());
$('#roll-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const f = event.target.elements;
  await mutate('/rolls', 'POST', { player: f.player.value, count: Number(f.count.value), sides: Number(f.sides.value), modifier: Number(f.modifier.value) });
});
for (const [form, path] of [['#notes-form', '/notes'], ['#private-form', '/private-notes'], ['#voice-form', '/voice']]) {
  $(form).addEventListener('submit', async (event) => {
    event.preventDefault();
    const field = path === '/voice' ? 'url' : 'text';
    const value = event.target.elements[field].value;
    if (await mutate(path, 'PUT', { [field]: value }) && event.target.elements[field].value === value) {
      dirtyForms.delete(form);
    }
  });
}

try {
  if (location.hash) {
    const parts = location.hash.slice(1).split(':');
    if (parts.length !== 2) throw new Error('Invalid room link.');
    credentials = { room: decodeURIComponent(parts[0]), key: decodeURIComponent(parts[1]) };
    sessionStorage.setItem('adventure-table-room', JSON.stringify(credentials));
    history.replaceState(null, '', '/');
  } else {
    const stored = sessionStorage.getItem('adventure-table-room');
    if (stored) credentials = JSON.parse(stored);
  }
  if (credentials) { showRoom(); refresh(); }
} catch (problem) { showError(problem.message); }
setInterval(refresh, 3000);
