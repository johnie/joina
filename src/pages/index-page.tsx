import {
  Calendar03Icon,
  Location01Icon,
  WorkIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from '@tanstack/react-router';
import { allJobs } from 'content-collections';
import { GodOmsorgLogo } from '@/components/god-omsorg';
import { ShaStamp } from '@/components/sha';
import { Card } from '@/components/ui/card';
import { company } from '@/lib/company';

const sortedJobs = allJobs
  .filter((job) => job.status !== 'closed')
  .sort((a, b) => a.order - b.order);

export function IndexPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-16" id="main-content">
      <div className="mb-16 text-center">
        <h1 className="font-extrabold font-heading text-5xl text-amber-600 tracking-tight md:text-6xl">
          Joina Johnie
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Jobba som personlig assistent
        </p>
      </div>

      <section>
        <h2 className="mb-8 font-bold font-heading text-2xl text-amber-600">
          Öppna tjänster
        </h2>
        <div className="flex flex-col gap-4">
          {sortedJobs.map((job) => (
            <Link
              className="group block"
              key={job.slug}
              params={{ slug: job.slug }}
              to="/jobb/$slug"
            >
              <Card className="transition-all duration-200 hover:border-teal-500/50 hover:bg-accent/50 hover:shadow-md">
                <div className="space-y-3 px-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <span>{job.type}</span>
                    <span className="text-amber-600">·</span>
                    <span>{job.location}</span>
                  </div>
                  <h3 className="font-heading text-2xl text-amber-600 transition-colors group-hover:text-teal-500">
                    {job.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{job.summary}</p>
                  <div className="flex flex-wrap gap-4 pt-1 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon
                        className="text-amber-600"
                        icon={WorkIcon}
                        size={14}
                      />
                      {job.percentage}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon
                        className="text-amber-600"
                        icon={Calendar03Icon}
                        size={14}
                      />
                      {job.hours}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HugeiconsIcon
                        className="text-amber-600"
                        icon={Location01Icon}
                        size={14}
                      />
                      {job.location}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {sortedJobs.length === 0 && (
        <p className="text-center text-muted-foreground">
          Det finns inga lediga tjänster just nu. Kom tillbaka snart!
        </p>
      )}

      <a
        aria-label={`${company.name} (öppnas i nytt fönster)`}
        href={company.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GodOmsorgLogo className="mx-auto mt-16" />
      </a>
      <p className="mt-2 text-balance text-center text-muted-foreground text-sm">
        {company.description}
      </p>

      <ShaStamp />
    </main>
  );
}
