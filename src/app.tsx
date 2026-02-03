import { MDXContent } from '@content-collections/mdx/react';
import {
  ArrowDown01Icon,
  Calendar03Icon,
  WorkIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { allPages } from 'content-collections';
import { ApplyCard } from '@/components/apply-card';
import { FaqAccordion } from '@/components/faq-accordion';
import { GodOmsorgLogo } from '@/components/god-omsorg';
import { JobHighlights } from '@/components/job-highlights';
import { JobMetaCard } from '@/components/job-meta';
import { MDXImage } from '@/components/mdx/image';
import { MDXLink } from '@/components/mdx/link';
import { ShaStamp } from '@/components/sha';
import { Button } from '@/components/ui/button';
import { APPLICATION_DEADLINE } from './constants/application';

const JOB_HIGHLIGHTS = [
  { icon: WorkIcon, label: 'Tjänstegrad', value: '50%' },
  {
    icon: Calendar03Icon,
    label: 'Arbetstider',
    value: '15:00-19:00, vardagar',
  },
];

const JOB_METADATA = [
  { label: 'Typ av tjänst', value: '50%' },
  { label: 'Arbetstider', value: '15:00-19:00, vardagar' },
  { label: 'Platser', value: 'Sigtuna/Stockholm' },
  {
    label: 'Sist ansökningsdag',
    value: new Date(APPLICATION_DEADLINE).toLocaleDateString('sv-SE'),
  },
];

const COMPANY_INFO = {
  name: 'God Omsorg',
  url: 'https://godomsorg.se',
  description:
    'God Omsorg - en del av God Assistans, bedriver avlösarservice, ledsagarservice och personlig Assistans.',
};

const MDX_COMPONENTS = {
  FaqAccordion,
  a: MDXLink,
  img: MDXImage,
};

function App() {
  const indexPage = allPages.find(
    (page) => page._meta.fileName === 'index.mdx'
  );

  if (!indexPage) {
    return <div>Inget innehåll hittades.</div>;
  }

  return (
    <main id="main-content">
      <article className="prose prose-stone dark:prose-invert max-w-full prose-ul:list-disc prose-headings:font-heading prose-a:text-teal-500 prose-headings:text-amber-600 text-sm prose-ol:leading-tight prose-p:leading-7 prose-ul:leading-tight prose-a:underline-offset-4 marker:text-teal-500">
        <p className="flex items-center justify-center gap-2 text-center text-muted-foreground text-sm">
          <span>Personlig Assistans</span>
          <span className="text-amber-600">•</span>
          <span>Sigtuna/Stockholm</span>
        </p>
        <h1 className="scroll-m-20 text-balance text-center font-extrabold text-4xl tracking-tight">
          {indexPage.title}
        </h1>
        <JobHighlights items={JOB_HIGHLIGHTS} />
        <div className="not-prose flex justify-center">
          <Button asChild className="gap-2" size="sm">
            <a href="#ansok">
              Ansök nu
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
            </a>
          </Button>
        </div>
        <MDXContent code={indexPage.mdx} components={MDX_COMPONENTS} />
        <section id="ansok">
          <ApplyCard />
        </section>
        <JobMetaCard items={JOB_METADATA} />
      </article>
      <a
        aria-label={`${COMPANY_INFO.name} (öppnas i nytt fönster)`}
        href={COMPANY_INFO.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GodOmsorgLogo className="mx-auto mt-8" />
      </a>
      <p className="mt-2 text-center text-muted-foreground text-sm">
        {COMPANY_INFO.description}
      </p>
      <ShaStamp />
    </main>
  );
}

export default App;
