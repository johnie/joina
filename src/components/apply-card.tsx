import {
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Mail01Icon,
  PauseIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ApplicationModal } from '@/components/application-modal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type ApplicationStatus = 'open' | 'paused' | 'closed';

interface ApplyCardProps {
  deadline: string;
  email: string;
  formEnabled: boolean;
  status: ApplicationStatus;
  title: string;
}

function OpenApplicationCard({
  deadline,
  email,
  formEnabled,
  title,
}: ApplyCardProps) {
  const mailtoSubject = encodeURIComponent(`Ansökan: ${title}`);
  const mailtoHref = `mailto:${email}?subject=${mailtoSubject}`;

  return (
    <>
      <Card className="not-prose my-8">
        <CardHeader>
          <CardTitle className="font-heading text-amber-600 text-xl">
            Så här ansöker du
          </CardTitle>
          <CardDescription className="text-stone-700 dark:text-stone-300">
            Är du intresserad av tjänsten? Skicka din ansökan via e-post!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100">
              Din ansökan bör innehålla:
            </h4>
            <ul className="space-y-1 text-sm text-stone-700 dark:text-stone-300">
              <li className="flex items-start">
                <span className="mr-2 text-teal-500">✔︎</span>
                <span>
                  Ett personligt brev där du beskriver varför du är intresserad
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-teal-500">✔︎</span>
                <span>Ditt CV</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white/50 p-4 dark:border-stone-700 dark:bg-stone-900/50">
            <p className="mb-1 font-medium text-sm text-stone-900 dark:text-stone-100">
              Skicka din ansökan till:
            </p>
            <a
              className="font-semibold text-lg text-teal-600 hover:underline dark:text-teal-400"
              href={mailtoHref}
            >
              {email}
            </a>
          </div>
          <p className="text-stone-600 text-xs italic dark:text-stone-400">
            Vi går igenom ansökningar löpande och kan komma att tillsätta
            tjänsten innan sista ansökningsdagen, så skicka gärna in din ansökan
            så snart som möjligt.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          {formEnabled && <ApplicationModal />}
          <Button
            asChild
            className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 sm:w-auto dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
            size="lg"
            variant="outline"
          >
            <a href={mailtoHref}>
              <HugeiconsIcon icon={Mail01Icon} size={16} />
              Skicka via e-post
            </a>
          </Button>
        </CardFooter>
      </Card>
      <div className="not-prose mb-8 flex items-center gap-3 rounded-lg border border-amber-900 bg-amber-950/30 p-4">
        <HugeiconsIcon
          className="text-amber-400"
          icon={Calendar01Icon}
          size={20}
        />
        <div>
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
            Sista ansökningsdag
          </p>
          <p className="font-semibold text-amber-400 text-lg">{deadline}</p>
        </div>
      </div>
    </>
  );
}

function PausedApplicationCard({ email, title }: ApplyCardProps) {
  const mailtoSubject = encodeURIComponent(`Fråga om tjänsten: ${title}`);
  const mailtoHref = `mailto:${email}?subject=${mailtoSubject}`;

  return (
    <>
      <Card className="not-prose my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-amber-600 text-xl">
            <HugeiconsIcon icon={PauseIcon} size={24} />
            Ansökningar pausade
          </CardTitle>
          <CardDescription className="text-stone-700 dark:text-stone-300">
            Vi tar en paus med ansökningar just nu. Håll utkik för
            uppdateringar!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-stone-200 bg-white/50 p-4 dark:border-stone-700 dark:bg-stone-900/50">
            <p className="mb-1 font-medium text-sm text-stone-900 dark:text-stone-100">
              Har du frågor? Kontakta oss:
            </p>
            <a
              className="font-semibold text-lg text-teal-600 hover:underline dark:text-teal-400"
              href={mailtoHref}
            >
              {email}
            </a>
          </div>
        </CardContent>
      </Card>
      <div className="not-prose mb-8 flex items-center gap-3 rounded-lg border border-amber-900 bg-amber-950/30 p-4">
        <HugeiconsIcon className="text-amber-400" icon={PauseIcon} size={20} />
        <div>
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
            Status
          </p>
          <p className="font-semibold text-amber-400 text-lg">Pausad</p>
        </div>
      </div>
    </>
  );
}

function ClosedApplicationCard() {
  return (
    <>
      <Card className="not-prose my-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-amber-600 text-xl">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} />
            Tjänsten tillsatt
          </CardTitle>
          <CardDescription className="text-stone-700 dark:text-stone-300">
            Tjänsten är tillsatt. Tack till alla som sökte!
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="not-prose mb-8 flex items-center gap-3 rounded-lg border border-amber-900 bg-amber-950/30 p-4">
        <HugeiconsIcon
          className="text-amber-400"
          icon={CheckmarkCircle01Icon}
          size={20}
        />
        <div>
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
            Status
          </p>
          <p className="font-semibold text-amber-400 text-lg">Tillsatt</p>
        </div>
      </div>
    </>
  );
}

export function ApplyCard(props: ApplyCardProps) {
  if (props.status === 'paused') {
    return <PausedApplicationCard {...props} />;
  }

  if (props.status === 'closed') {
    return <ClosedApplicationCard />;
  }

  return <OpenApplicationCard {...props} />;
}
