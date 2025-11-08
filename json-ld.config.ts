import type { Thing, WithContext } from 'schema-dts';

/**
 * JSON-LD structured data configuration
 * This file contains all structured data schemas that will be injected into index.html
 */
export const jsonLdData: WithContext<Thing>[] = [
  {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: 'Personlig Assistent',
    description:
      'Vill du arbeta som personlig assistent och göra skillnad i vardagen för en driven crip? Jag söker en strukturerad och proaktiv person som kan hjälpa mig få vardagen att fungera smidigt. Som personlig assistent kommer du få en varierad roll där du kombinerar administrativa uppgifter med praktiskt stöd i vardagen.',
    identifier: {
      '@type': 'PropertyValue',
      name: 'God Omsorg',
      value: 'PA-2025-Johnie',
    },
    datePosted: '2025-11-01',
    validThrough: '2026-01-31T23:59:59+01:00',
    employmentType: ['PART_TIME', 'FULL_TIME'],
    hiringOrganization: {
      '@type': 'Organization',
      name: 'God Omsorg',
      sameAs: 'https://godomsorg.se',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Sigtuna',
        addressRegion: 'Stockholm',
        addressCountry: 'SE',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: {
        '@type': 'QuantitativeValue',
        unitText: 'HOUR',
      },
    },
    qualifications:
      'Strukturerad och god samarbetsförmåga, utmärkta kunskaper i svenska och goda kunskaper i engelska, diskret och kan hantera konfidentiell information, serviceinriktad och flexibel',
    responsibilities:
      'Assistera med professionella och vardagliga uppgifter, praktiskt stöd i vardagen, assistans på resor, stöd vid möten',
    skills:
      'Personlig assistans, administration, kommunikation, svenska, engelska, flexibilitet, sekretess',
    educationRequirements:
      'Erfarenhet av assistentarbete eller liknande roll är meriterande',
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 0,
    },
    incentiveCompensation:
      'OB-tillägg för obekväm arbetstid, semesterersättning enligt kollektivavtal, tjänstepension, ersättning för resor och utlägg, friskvårdsbidrag',
    workHours:
      '75-100% efter överenskommelse, huvudsakligen vardagar dagtid, schemaläggning i samråd 2-4 veckor i förväg',
    jobBenefits:
      'Trygg anställning genom kollektivavtal, kompetensutveckling och fortlöpande utbildning, professionellt stöd från samordnare, friskvårdsbidrag',
    directApply: true,
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'SE',
    },
    jobLocationType: 'TELECOMMUTE',
  },
];
