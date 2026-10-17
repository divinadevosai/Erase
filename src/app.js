import { brokers, quickWins, checkedLabel } from './brokers.js';
import { erasureLetter, followUpLetter, mailto } from './letters.js';
import { today, addMonth, daysBetween, pretty } from './dates.js';
import * as store from './store.js';

let state = store.load();
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// ---------- your details ----------

const form = $('#me');
for (const [k, v] of Object.entries(state.me)) if (form.elements[k]) form.elements[k].value = v;
form.addEventListener('submit', (e) => e.preventDefault());
form.addEventListener('input', (e) => {
  if (!(e.target.name in state.me)) return;
  state.me[e.target.name] = e.target.value;
  store.save(state);
  render();
});

const ready = () => state.me.name.trim() && state.me.email.trim();

// ---------- brokers ----------

function statusOf(id) {
  const r = state.requests[id];
  if (!r) return { key: 'todo' };
  const due = addMonth(r.sentOn);
  const left = daysBetween(today(), due);
  if (r.status === 'sent' && left < 0) return { key: 'overdue', r, due, left };
  return { key: r.status, r, due, left };
}

const pill = {
  todo: ['Not sent', ''],
  sent: ['Waiting', 'wait'],
  overdue: ['Overdue', 'bad'],
  replied: ['Replied', 'wait'],
  done: ['Done', 'ok'],
};

function brokerCard(b) {
  const s = statusOf(b.id);
  const [label, tone] = pill[s.key];
  const letter = s.key === 'overdue' ? followUpLetter(b, state.me, s.r.sentOn, today()) : erasureLetter(b, state.me, today());
  const off = ready() ? '' : 'disabled';
  let line = '';
  let actions = '';
  if (s.key === 'todo') {
    actions = `<a class="btn primary" ${ready() ? `href="${esc(mailto(b.email, letter, b.cc))}"` : 'aria-disabled="true"'} data-act="opened">Open in email</a>
      <button class="btn" data-act="copy" ${off}>Copy letter</button>
      <button class="btn" data-act="sent" ${off}>I sent it</button>`;
  } else if (s.key === 'sent') {
    line = `Sent ${pretty(s.r.sentOn)}. Reply due by <b>${pretty(s.due)}</b> (${s.left === 0 ? 'today' : `${s.left} day${s.left === 1 ? '' : 's'} left`}). If they ask you to prove who you are, the month restarts from your answer.`;
    actions = `<button class="btn" data-act="replied">They replied</button><button class="btn quiet" data-act="undo">Undo</button>`;
  } else if (s.key === 'overdue') {
    line = `No reply. (If they asked you for ID, count a month from when you answered.) The deadline was ${pretty(s.due)}, ${-s.left} day${s.left === -1 ? '' : 's'} ago. Send a follow-up, and if they still ignore you, <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">complain to the ICO</a>.`;
    actions = `<a class="btn primary" href="${esc(mailto(b.email, letter, b.cc))}" data-act="followed">Send follow-up</a>
      <button class="btn" data-act="copy">Copy follow-up</button>
      <button class="btn" data-act="replied">They replied</button>`;
  } else if (s.key === 'replied') {
    line = 'Check that their reply confirms your data was erased. If they kept something, they should say which exemption applies.';
    actions = `<button class="btn primary" data-act="done">It's sorted</button><button class="btn quiet" data-act="undo">Undo</button>`;
  } else {
    line = `Sorted. Request sent ${pretty(s.r.sentOn)}.`;
    actions = '<button class="btn quiet" data-act="undo">Undo</button>';
  }
  return `<li class="card ${s.key}" data-id="${b.id}">
    <div class="row"><h3>${esc(b.name)}</h3><span class="pill ${tone}">${label}</span></div>
    <p class="what">${esc(b.what)}</p>
    <p class="addr"><code>${esc(b.email)}</code>${b.cc ? ` <span class="cc">cc</span> <code>${esc(b.cc)}</code>` : ''} <a class="src ${b.checked}" href="${esc(b.source)}" target="_blank" rel="noopener noreferrer">${checkedLabel[b.checked]}</a></p>
    ${line ? `<p class="line">${line}</p>` : ''}
    <div class="actions">${actions}</div>
    ${s.key === 'todo' || s.key === 'overdue' ? `<details><summary>Read the ${s.key === 'overdue' ? 'follow-up' : 'letter'}</summary><p class="subject">${esc(letter.subject)}</p><pre>${esc(letter.body)}</pre></details>` : ''}
  </li>`;
}

function winCard(w) {
  const done = !!state.wins[w.id];
  return `<li class="card ${done ? 'done' : ''}" data-win="${w.id}">
    <div class="row"><h3>${esc(w.name)}</h3><label class="tick"><input type="checkbox" ${done ? 'checked' : ''}> Done</label></div>
    <p class="what">${esc(w.what)}</p>
    <div class="actions"><a class="btn" href="${esc(w.url)}" target="_blank" rel="noopener noreferrer">${esc(w.action)}</a></div>
  </li>`;
}

function summary() {
  const all = brokers.map((b) => statusOf(b.id).key);
  const sent = all.filter((k) => k !== 'todo').length;
  const overdue = all.filter((k) => k === 'overdue').length;
  const wins = quickWins.filter((w) => state.wins[w.id]).length;
  const parts = [`${sent} of ${brokers.length} letters sent`, `${wins} of ${quickWins.length} quick wins`];
  if (overdue) parts.push(`<b class="bad">${overdue} overdue</b>`);
  return parts.join(' · ');
}

function render() {
  $('#summary').innerHTML = summary();
  $('#need-details').hidden = !!ready();
  $('#wins').innerHTML = quickWins.map(winCard).join('');
  $('#brokers').innerHTML = brokers.map(brokerCard).join('');
}

// ---------- actions ----------

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2400);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function set(id, patch) {
  state.requests[id] = patch && { ...state.requests[id], ...patch };
  if (!patch) delete state.requests[id];
  store.save(state);
  render();
}

$('#brokers').addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.matches('[disabled],[aria-disabled]')) return;
  const b = brokers.find((x) => x.id === el.closest('[data-id]').dataset.id);
  const s = statusOf(b.id);
  switch (el.dataset.act) {
    case 'opened':
      toast('Your email app should open. Send it, then press "I sent it".');
      break;
    case 'copy': {
      const l = s.key === 'overdue' ? followUpLetter(b, state.me, s.r.sentOn, today()) : erasureLetter(b, state.me, today());
      await copy(`To: ${b.email}\n${b.cc ? `Cc: ${b.cc}\n` : ''}Subject: ${l.subject}\n\n${l.body}`);
      toast('Copied, with the address and subject at the top.');
      break;
    }
    case 'sent': set(b.id, { status: 'sent', sentOn: today() }); toast(`Tracking ${b.name}. They have until ${pretty(addMonth(today()))}.`); break;
    case 'followed': state.requests[b.id].followUpOn = today(); store.save(state); toast('Follow-up opened in your email app.'); break;
    case 'replied': set(b.id, { status: 'replied' }); break;
    case 'done': set(b.id, { status: 'done' }); break;
    case 'undo': {
      const r = state.requests[b.id];
      if (r.status === 'sent') set(b.id, null);
      else set(b.id, { status: r.status === 'done' ? 'replied' : 'sent' });
      break;
    }
  }
});

$('#wins').addEventListener('change', (e) => {
  const id = e.target.closest('[data-win]').dataset.win;
  if (e.target.checked) state.wins[id] = today();
  else delete state.wins[id];
  store.save(state);
  render();
});

// ---------- your data ----------

$('#export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
  a.download = `erase-backup-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$('#import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data.me !== 'object') throw new Error();
    state = store.clean(data);
    store.save(state);
    for (const [k, v] of Object.entries(state.me)) if (form.elements[k]) form.elements[k].value = v;
    render();
    toast('Backup restored.');
  } catch {
    toast("That file isn't an Erase backup.");
  }
});

$('#clear').addEventListener('click', () => {
  if (!confirm('Erase your details and your progress from this browser? Letters you already sent are not affected.')) return;
  store.clear();
  state = store.blank();
  form.reset();
  render();
  toast('Everything Erase stored has been deleted.');
});

render();
