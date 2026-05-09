import type {
  BreadcrumbList,
  FAQPage,
  JobPosting,
  WithContext,
} from 'schema-dts';
import { SITE_URL } from '@/config';
import { parseSwedishDateEndOfDay } from './swedish-date';

interface JobLike {
  datePosted?: string;
  deadline: string;
  email: string;
  hours: string;
  image?: string;
  location: string;
  percentage: string;
  slug: string;
  status: 'open' | 'paused' | 'closed';
  summary: string;
  title: string;
  type: string;
}

interface QnaLike {
  answer: string;
  order: number;
  title: string;
}

function toIsoDate(input?: string): string | undefined {
  if (!input) {
    return;
  }
  const d = parseSwedishDateEndOfDay(input) ?? new Date(input);
  if (Number.isNaN(d.getTime())) {
    return;
  }
  return d.toISOString();
}

function employmentTypeFor(percentage: string): JobPosting['employmentType'] {
  const num = Number.parseInt(percentage.replace(/[^\d]/g, ''), 10);
  if (Number.isFinite(num) && num >= 80) {
    return ['FULL_TIME'];
  }
  return ['PART_TIME'];
}

export function buildJobPostingLd(job: JobLike): WithContext<JobPosting> {
  const url = `${SITE_URL}/jobb/${job.slug}`;
  const ogImage = `${SITE_URL}/og/${job.slug}.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.summary,
    identifier: {
      '@type': 'PropertyValue',
      name: 'God Omsorg',
      value: `joina-${job.slug}`,
    },
    datePosted: toIsoDate(job.datePosted) ?? new Date().toISOString(),
    validThrough: toIsoDate(job.deadline),
    employmentType: employmentTypeFor(job.percentage),
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
        addressRegion: 'Stockholms län',
        addressCountry: 'SE',
      },
    },
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'SE',
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'SEK',
      value: {
        '@type': 'QuantitativeValue',
        minValue: 150,
        maxValue: 180,
        unitText: 'HOUR',
      },
    },
    workHours: job.hours,
    incentiveCompensation:
      'OB-tillägg, semesterersättning enligt kollektivavtal, tjänstepension, friskvårdsbidrag, ersättning för resor och utlägg.',
    jobBenefits:
      'Trygg anställning genom kollektivavtal, kompetensutveckling, professionellt stöd från samordnare.',
    qualifications:
      'Strukturerad, självgående och flexibel. Stark svenska. Diskretion och förmåga att hantera konfidentiell information.',
    responsibilities:
      'Praktiskt stöd i vardagen, assistans hemma, på kontoret och vid resor; tänka ett steg före; bidra till en smidig vardag.',
    skills:
      'Personlig assistans, samarbetsförmåga, kommunikation, svenska, flexibilitet.',
    educationRequirements:
      'Erfarenhet av assistentarbete eller liknande roll är meriterande, men inget krav.',
    experienceRequirements: {
      '@type': 'OccupationalExperienceRequirements',
      monthsOfExperience: 1,
    },
    directApply: true,
    url,
    image: job.image ?? ogImage,
  };
}

export function buildBreadcrumbLd(
  job: Pick<JobLike, 'slug' | 'title'>
): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Lediga tjänster',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: job.title,
        item: `${SITE_URL}/jobb/${job.slug}`,
      },
    ],
  };
}

export function buildFaqLd(qnas: QnaLike[]): WithContext<FAQPage> {
  const sorted = [...qnas].sort((a, b) => a.order - b.order);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: sorted.map((q) => ({
      '@type': 'Question',
      name: q.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

export function serializeJsonLd(
  schemas: WithContext<JobPosting | BreadcrumbList | FAQPage>[]
): string {
  return schemas
    .map(
      (s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`
    )
    .join('');
}
