// Who holds your data, and how to reach them. UK only for now.
//
// checked:
//   official  the address is on the company's own privacy page
//   register  the address is on the company's entry in the ICO register
//   directory the address comes from a third-party directory (datarequests.org); check it before sending
//
// kind 'cra' is a credit reference agency. They can lawfully keep the credit data lenders report
// to them, so their letter asks them to erase everything else and to stop marketing use.

export const brokers = [
  {
    id: 'experian',
    name: 'Experian',
    legalName: 'Experian Ltd',
    kind: 'cra',
    what: 'Credit reference agency that also sells marketing and identity data.',
    email: 'uk.dpo@experian.com',
    checked: 'official',
    source: 'https://experian.co.uk/privacy/consumer-information-portal/data-rights/your-rights',
  },
  {
    id: 'equifax',
    name: 'Equifax',
    legalName: 'Equifax Ltd',
    kind: 'cra',
    what: 'Credit reference agency that also sells marketing and identity data.',
    email: 'UKDPO@equifax.com',
    checked: 'official',
    source: 'https://www.equifax.co.uk/downloads/complaint-procedure.pdf',
  },
  {
    id: 'transunion',
    name: 'TransUnion',
    legalName: 'TransUnion Information Group Limited',
    kind: 'cra',
    what: 'Credit reference agency (formerly Callcredit) that also sells marketing data.',
    email: 'dpo@transunion.co.uk',
    checked: 'register',
    source: 'https://ico.org.uk/ESDWebPages/Entry/Z2222218',
  },
  {
    id: 'acxiom',
    name: 'Acxiom',
    legalName: 'Acxiom Ltd',
    kind: 'marketing',
    what: 'One of the largest marketing data brokers. Builds consumer profiles for advertisers.',
    // Acxiom's UK policy and its newer global GDPR notice name different addresses, so we send to both.
    email: 'ukconsumerservices@acxiom.com',
    cc: 'AskPrivacy@acxiom.com',
    checked: 'official',
    source: 'https://www.acxiom.co.uk/privacy/uk-privacy-policy/',
  },
  {
    id: 'liveramp',
    name: 'LiveRamp',
    legalName: 'LiveRamp UK Ltd',
    kind: 'marketing',
    what: 'Links your identity across websites and apps so advertisers can target you.',
    email: 'ukprivacy@liveramp.com',
    checked: 'official',
    source: 'https://liveramp.uk/privacy/',
  },
];

// Steps that use a form or a register instead of a letter. Each one cuts off data at the source.
export const quickWins = [
  {
    id: 'open-register',
    name: 'Leave the open electoral register',
    what: 'Anyone can buy the open register, and people-search sites like 192.com rebuild their lists from it. Leaving it stops your details being sold in the next update. You stay on the full register and can still vote.',
    url: 'https://www.gov.uk/electoral-register/opt-out-of-the-open-register',
    action: 'Open GOV.UK',
  },
  {
    id: '192',
    name: 'Remove yourself from 192.com',
    what: 'A people-search site that shows names, addresses and neighbours. Their form removes you, usually within a day or two. Click the link in the email they send, or nothing happens.',
    url: 'https://www.192.com/c01/new-request/',
    action: 'Open 192.com form',
  },
  {
    id: 'mps',
    name: 'Join the Mailing Preference Service',
    what: 'Free. Direct mail companies that follow the industry code check this list and stop sending you addressed junk mail. It isn\'t a law, so it cuts most junk mail, not all of it.',
    url: 'https://www.mpsonline.org.uk/',
    action: 'Open MPS',
  },
  {
    id: 'tps',
    name: 'Join the Telephone Preference Service',
    what: 'Free, and backed by law: UK companies must not make sales calls to numbers on this list unless you have told them they can.',
    url: 'https://www.tpsonline.org.uk/',
    action: 'Open TPS',
  },
];

export const checkedLabel = {
  official: 'Address from their own privacy page',
  register: 'Address from the ICO register',
  directory: 'Check this address before sending',
};
