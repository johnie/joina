import { MDXContent } from '@content-collections/mdx/react';
import { ArrowDown01Icon, ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link, useParams } from '@tanstack/react-router';
import { allJobs } from 'content-collections';
import { ApplyCard } from '@/components/apply-card';
import { FaqAccordion } from '@/components/faq-accordion';
import { GodOmsorgLogo } from '@/components/god-omsorg';
import { JobHighlights } from '@/components/job-highlights';
import { JobMetaCard } from '@/components/job-meta';
import { MDXImage } from '@/components/mdx/image';
import { MDXLink } from '@/components/mdx/link';
import { ShaStamp } from '@/components/sha';
import { Button } from '@/components/ui/button';
import { company } from '@/lib/company';
import { getIcon } from '@/lib/icons';

const MDX_COMPONENTS = {
  a: MDXLink,
  img: MDXImage,
};

export function JobDetailPage() {
  const { slug } = useParams({ strict: false });
  const job = allJobs.find((j) => j.slug === slug);

  if (!job) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16" id="main-content">
        <p>Jobbannonsen hittades inte.</p>
        <Link className="text-teal-500 underline underline-offset-4" to="/">
          Tillbaka till alla tjänster
        </Link>
      </main>
    );
  }

  const highlights = job.highlights.map((h) => ({
    icon: getIcon(h.icon),
    label: h.label,
    value: h.value,
  }));

  const metadata = [
    { label: 'Typ av tjänst', value: job.percentage },
    { label: 'Arbetstider', value: job.hours },
    { label: 'Platser', value: job.location },
    { label: 'Sist ansökningsdag', value: job.deadline },
  ];

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16" id="main-content">
      <Link
        className="mb-8 inline-flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-teal-500"
        to="/"
      >
        <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
        Alla tjänster
      </Link>

      <article className="prose prose-stone dark:prose-invert max-w-full prose-ul:list-disc prose-headings:font-heading prose-a:text-teal-500 prose-headings:text-amber-600 text-sm prose-ol:leading-tight prose-p:leading-7 prose-ul:leading-tight prose-a:underline-offset-4 marker:text-teal-500">
        <p className="flex items-center justify-center gap-2 text-center text-muted-foreground text-sm">
          <span>{job.type}</span>
          <span className="text-amber-600">&middot;</span>
          <span>{job.location}</span>
        </p>
        <h1 className="scroll-m-20 text-balance text-center font-extrabold text-4xl tracking-tight">
          {job.title}
        </h1>
        <JobHighlights items={highlights} />
        <div className="not-prose flex justify-center">
          <Button asChild className="gap-2" size="sm">
            <a href="#ansok">
              Ansök nu
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
            </a>
          </Button>
        </div>
        <MDXContent code={job.mdx} components={MDX_COMPONENTS} />
        <section>
          <h2>Vanliga frågor</h2>
          <p>
            Vill du veta mer om rollen eller har frågor? Du är varmt välkommen
            att kontakta mig på <a href={`mailto:${job.email}`}>{job.email}</a>
          </p>
          <FaqAccordion />
        </section>
        <hr />
        <p className="text-muted-foreground text-xs italic">
          Till dig som arbetar inom rekrytering- och bemanningsföretag samt med
          annonsförsäljning: Vi undanber oss vänligt men bestämt erbjudanden om
          annonserings- och rekryteringstjänster i samband med den här annonsen.
        </p>
        <section id="ansok">
          <ApplyCard
            deadline={job.deadline}
            email={job.email}
            formEnabled={job.formEnabled}
            status={job.status}
            title={job.title}
          />
        </section>
        <JobMetaCard items={metadata} />
      </article>

      <a
        aria-label={`${company.name} (öppnas i nytt fönster)`}
        href={company.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GodOmsorgLogo className="mx-auto mt-8" />
      </a>
      <p className="mt-2 text-balance text-center text-muted-foreground text-sm">
        {company.description}
      </p>
      <ShaStamp />
    </main>
  );
}
