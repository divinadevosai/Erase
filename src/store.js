// Everything Erase knows lives in this one localStorage entry, on this computer only.
const KEY = 'erase:v1';
const STATUSES = new Set(['sent', 'replied', 'done']);
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function blank() {
  return { me: { name: '', email: '', address: '', previous: '', phone: '', dob: '' }, requests: {}, wins: {} };
}

// Saved data and backup files are only trusted after this: anything that isn't the right shape
// is dropped, so a damaged or hand-edited backup can't break the page.
export function clean(data) {
  const out = blank();
  if (!data || typeof data !== 'object') return out;
  for (const k of Object.keys(out.me)) if (typeof data.me?.[k] === 'string') out.me[k] = data.me[k].slice(0, 2000);
  for (const [id, r] of Object.entries(data.requests ?? {})) {
    if (r && STATUSES.has(r.status) && DAY.test(r.sentOn)) {
      out.requests[id] = { status: r.status, sentOn: r.sentOn, ...(DAY.test(r.followUpOn) && { followUpOn: r.followUpOn }) };
    }
  }
  for (const [id, on] of Object.entries(data.wins ?? {})) if (DAY.test(on)) out.wins[id] = on;
  return out;
}

export function load() {
  try { return clean(JSON.parse(localStorage.getItem(KEY))); } catch { return blank(); }
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function clear() {
  try { localStorage.removeItem(KEY); } catch {}
}
