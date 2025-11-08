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
    (page) => page._meta.fileName === 'index.mdx',
  );

  if (!indexPage) {
    return <div>Inget innehåll hittades.</div>;
  }

  return (
    <main>
      <article className="prose prose-stone dark:prose-invert prose-headings:text-amber-600 prose-headings:font-heading prose-ul:leading-tight prose-ol:leading-tight prose-p:leading-7 text-sm prose-a:text-teal-500 prose-a:underline-offset-4 prose-ul:list-disc marker:text-teal-500 max-w-full">
        <p className="text-muted-foreground text-sm text-center gap-2 flex justify-center items-center">
          <span>Personlig Assistans</span>
          <span className="text-amber-600">•</span>
          <span>Sigtuna/Stockholm</span>
        </p>
        <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
          {indexPage.title}
        </h1>
        <MDXContent code={indexPage.mdx} components={MDX_COMPONENTS} />
        <ApplyCard />
        <JobMetaCard items={JOB_METADATA} />
      </article>
      <a
        href={COMPANY_INFO.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={COMPANY_INFO.name}
      >
        <GodOmsorgLogo className="mx-auto mt-8" />
      </a>
      <p className="text-center text-sm text-muted-foreground mt-2">
        {COMPANY_INFO.description}
      </p>
      <ShaStamp />
    </main>
  );
}

export default App;
