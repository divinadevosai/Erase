import { addMonth, pretty } from './dates.js';

function detailLines(me) {
  return [
    ['Name', me.name],
    ['Email', me.email],
    ['Address', me.address],
    ['Previous addresses', me.previous],
    ['Phone', me.phone],
    ['Date of birth', me.dob],
  ]
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v.trim().replace(/\s*\n\s*/g, ', ')}`);
}

export function erasureLetter(broker, me, on) {
  const cra = broker.kind === 'cra'
    ? ['', 'I understand you may need to keep the credit data that lenders report to you. This request covers everything else, in particular any data you use, sell or license for marketing, list-building, data matching or identity products.']
    : [];
  const body = [
    `To the Data Protection Officer, ${broker.legalName}`,
    '',
    'I am writing to ask you to erase all personal data you hold about me.',
    '',
    '1. I object to the processing of my personal data for direct marketing, including any profiling related to it, under Article 21(2) UK GDPR. This right is absolute, so please stop this processing.',
    '2. Please erase my personal data under Article 17(1) UK GDPR. It is not necessary for any purpose I agreed to, I have objected to its processing, and I do not consent to its use.',
    '3. Under Article 19 UK GDPR, please tell every organisation you have disclosed my data to about this erasure, and tell me who they are.',
    '4. If you keep any of my data because an exemption applies, please tell me which data and which exemption.',
    ...cra,
    '',
    'These details are to help you find me in your records:',
    ...detailLines(me),
    '',
    'Please use these details only to deal with this request. Do not add them to your records for any other purpose.',
    '',
    `You must reply without undue delay and within one month of receiving this request (Article 12(3) UK GDPR), so by ${pretty(addMonth(on))}. If I do not hear from you, I may complain to the Information Commissioner's Office.`,
    '',
    'Yours faithfully,',
    me.name.trim(),
    pretty(on),
  ];
  return { subject: 'Erasure request and objection to direct marketing (UK GDPR Articles 17 and 21)', body: body.join('\n') };
}

export function followUpLetter(broker, me, sentOn, on) {
  const body = [
    `To the Data Protection Officer, ${broker.legalName}`,
    '',
    `On ${pretty(sentOn)} I asked you to erase my personal data and objected to its use for direct marketing (UK GDPR Articles 17 and 21). The one-month deadline under Article 12(3) passed on ${pretty(addMonth(sentOn))} and I have not had a reply.`,
    '',
    'Please confirm within 7 days that you have erased my data, or tell me why you have not. If I do not hear from you, I will complain to the Information Commissioner\'s Office.',
    '',
    'My details, to find the original request:',
    ...detailLines(me),
    '',
    'Yours faithfully,',
    me.name.trim(),
    pretty(on),
  ];
  return { subject: 'Overdue: erasure request (UK GDPR Article 17)', body: body.join('\n') };
}

export function mailto(to, { subject, body }, cc) {
  const enc = (s) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  const addr = (a) => encodeURIComponent(a).replace('%40', '@');
  return `mailto:${addr(to)}?${cc ? `cc=${addr(cc)}&` : ''}subject=${enc(subject)}&body=${enc(body)}`;
}
