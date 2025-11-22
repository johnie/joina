import { MDXContent } from '@content-collections/mdx/react';
import { allPages } from 'content-collections';
import { ApplyCard } from '@/components/apply-card';
import { FaqAccordion } from '@/components/faq-accordion';
import { GodOmsorgLogo } from '@/components/god-omsorg';
import { JobMetaCard } from '@/components/job-meta';
import { MDXImage } from '@/components/mdx/image';
import { ShaStamp } from '@/components/sha';

const JOB_METADATA = [
  { label: 'Typ av tjänst', value: '75-100%' },
  { label: 'Platser', value: 'Sigtuna/Stockholm' },
  { label: 'Sist ansökningsdag', value: '2026-01-31' },
];

const COMPANY_INFO = {
  name: 'God Omsorg',
  url: 'https://godomsorg.se',
  description:
    'God Omsorg - en del av God Assistans, bedriver avlösarservice, ledsagarservice och personlig Assistans.',
};

const MDX_COMPONENTS = {
  FaqAccordion,
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
    <main>
      <article className="prose prose-stone dark:prose-invert max-w-full prose-ul:list-disc prose-headings:font-heading prose-a:text-teal-500 prose-headings:text-amber-600 text-sm prose-ol:leading-tight prose-p:leading-7 prose-ul:leading-tight prose-a:underline-offset-4 marker:text-teal-500">
        <p className="flex items-center justify-center gap-2 text-center text-muted-foreground text-sm">
          <span>Personlig Assistans</span>
          <span className="text-amber-600">•</span>
          <span>Sigtuna/Stockholm</span>
        </p>
        <h1 className="scroll-m-20 text-balance text-center font-extrabold text-4xl tracking-tight">
          {indexPage.title}
        </h1>
        <MDXContent code={indexPage.mdx} components={MDX_COMPONENTS} />
        <ApplyCard />
        <JobMetaCard items={JOB_METADATA} />
      </article>
      <a
        aria-label={COMPANY_INFO.name}
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
