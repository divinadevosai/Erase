// Dates are plain 'YYYY-MM-DD' strings in local time, so nothing shifts across time zones.

export function today(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

// UK GDPR gives an organisation one calendar month from the day it receives a request.
// If the next month has no matching day (31 Jan → Feb), the deadline is that month's last day.
export function addMonth(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const due = new Date(Date.UTC(y, m, Math.min(d, lastDay)));
  return due.toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
}

export function pretty(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
