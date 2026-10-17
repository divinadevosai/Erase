# Erase

**Make data brokers delete what they hold about you.**

Companies you've never heard of buy and sell your name, address and habits. Under UK GDPR they must stop using it for marketing when you object, erase it unless they have a legal reason to keep it, and reply within a month. Erase writes those letters for you, opens them in your own email app, and tracks who still owes you a reply. When a company misses its deadline, Erase writes the follow-up and points you to the ICO.

It's free and open source, and your details never leave your computer.

**Use it: https://getmydataerased.netlify.app**

## What it covers (UK, v0.1)

| | How |
|---|---|
| Experian, Equifax, TransUnion | Letter to the DPO. Credit data they must keep is excluded; marketing and identity data is not. |
| Acxiom, LiveRamp | Letter to the privacy team. |
| Open electoral register, 192.com, MPS, TPS | Quick wins: links to each official form, with a checklist. |

Every address shows where it came from: the company's own privacy page, the ICO register, or a third-party directory. Directory addresses are flagged so you check them before sending.

## Privacy

- Your details are kept in this browser's `localStorage` and nowhere else. There is no server, no analytics and no account.
- Anyone who uses the same browser profile, and any browser extension you've allowed to read pages, can see what's stored. On a shared computer, clear your data when you're done.
- The page's Content Security Policy sets `connect-src 'none'`, so the browser blocks every network request the page tries to make (fetch, beacons, WebSockets, images, scripts, form posts). Your details can't be sent anywhere, even by mistake. You can check this in your browser's developer tools.
- Letters go out through your own email app, so you can read them before sending.
- **Clear all my data** deletes everything Erase stored. **Save a backup** downloads your progress as a file in case you switch browsers.

## Run it

It's a static page with no build step.

```bash
npm run dev     # http://localhost:5050
npm test        # letter wording, deadlines, broker data
```

Opening `index.html` straight from disk won't work, because browsers block ES modules on `file://`.

## Adding a broker

Add an entry to `src/brokers.js` with a `source` link that shows the address. Use `checked: 'official'` only when the address is on the company's own site.

## Roadmap

- EU GDPR coverage, using the CC0 company database from [datarequests.org](https://www.datarequests.org/open-source).
- US state laws (CCPA and others).
- More UK brokers and people-search sites.

Erase isn't legal advice.
