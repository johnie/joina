import { Calendar, Mail } from 'lucide-react';
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
import {
  APPLICATION_DEADLINE,
  APPLICATION_FORM_ENABLED,
} from '@/constants/application';

export function ApplyCard() {
  return (
    <>
      <Card className="not-prose my-8">
        <CardHeader>
          <CardTitle className="font-heading text-amber-600 text-xl">
            Så här ansöker du
          </CardTitle>
          <CardDescription className="text-stone-700 dark:text-stone-300">
            {APPLICATION_FORM_ENABLED
              ? 'Är du intresserad av tjänsten? Ansök via vårt formulär eller skicka din ansökan via e-post!'
              : 'Är du intresserad av tjänsten? Skicka din ansökan via e-post!'}
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
              {APPLICATION_FORM_ENABLED
                ? 'Eller skicka din ansökan till:'
                : 'Skicka din ansökan till:'}
            </p>
            <a
              className="font-semibold text-lg text-teal-600 hover:underline dark:text-teal-400"
              href="mailto:jobb@johnie.se?subject=Ansökan: Personlig Assistent"
            >
              jobb@johnie.se
            </a>
          </div>
          <p className="text-stone-600 text-xs italic dark:text-stone-400">
            Vi går igenom ansökningar löpande och kan komma att tillsätta
            tjänsten innan sista ansökningsdagen, så skicka gärna in din ansökan
            så snart som möjligt.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          {APPLICATION_FORM_ENABLED && <ApplicationModal />}
          <Button
            asChild
            className="w-full border-teal-600 text-teal-600 hover:bg-teal-50 sm:w-auto dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
            size="lg"
            variant="outline"
          >
            <a href="mailto:jobb@johnie.se?subject=Ansökan: Personlig Assistent">
              <Mail />
              Skicka via e-post
            </a>
          </Button>
        </CardFooter>
      </Card>
      <div className="not-prose mb-8 flex items-center gap-3 rounded-lg border border-amber-900 bg-amber-950/30 p-4">
        <Calendar className="h-5 w-5 text-amber-400" />
        <div>
          <p className="font-medium text-sm text-stone-900 dark:text-stone-100">
            Sista ansökningsdag
          </p>
          <p className="font-semibold text-amber-400 text-lg">
            {APPLICATION_DEADLINE}
          </p>
        </div>
      </div>
    </>
  );
}
