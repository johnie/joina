import type { Organization, Person, WebSite, WithContext } from 'schema-dts';

const SITE_URL = 'https://joina.johnie.se';

const website: WithContext<WebSite> = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Joina – Personlig assistent åt Johnie',
  alternateName: 'Joina Johnie',
  url: SITE_URL,
  inLanguage: 'sv-SE',
  description:
    'Lediga tjänster som personlig assistent åt Johnie Hjelm i Sigtuna och Stockholm.',
  publisher: {
    '@type': 'Person',
    name: 'Johnie Hjelm',
  },
};

const person: WithContext<Person> = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Johnie Hjelm',
  url: 'https://johnie.se',
  jobTitle: 'Head of Engineering',
  worksFor: {
    '@type': 'Organization',
    name: 'Omni',
    url: 'https://omni.se',
  },
  sameAs: [
    'https://johnie.se',
    'https://hejaolika.se/artikel/tech-stjarna-och-sma-aktivist-johnies-dubbla-kamp/',
  ],
};

const hiringOrganization: WithContext<Organization> = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'God Omsorg',
  url: 'https://godomsorg.se',
  description:
    'Personlig assistans, ledsagarservice och avlösarservice. Kollektivavtal och professionellt stöd.',
};

export const jsonLdData: WithContext<WebSite | Person | Organization>[] = [
  website,
  person,
  hiringOrganization,
];
