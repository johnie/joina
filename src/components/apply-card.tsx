import { Mail } from 'lucide-react';
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

export function ApplyCard() {
  return (
    <Card className="not-prose my-8">
      <CardHeader>
        <CardTitle className="text-xl text-amber-600 font-heading">
          Så här ansöker du
        </CardTitle>
        <CardDescription className="text-stone-700 dark:text-stone-300">
          Är du intresserad av tjänsten? Ansök via vårt formulär eller skicka
          din ansökan via e-post!
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
        <div className="rounded-lg bg-white/50 dark:bg-stone-900/50 p-4 border border-stone-200 dark:border-stone-700">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
            Eller skicka din ansökan till:
          </p>
          <a
            href="mailto:jobb@johnie.se?subject=Ansökan: Personlig Assistent"
            className="text-lg font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            jobb@johnie.se
          </a>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 italic">
          Vi går igenom ansökningar löpande och kan komma att tillsätta tjänsten
          innan sista ansökningsdagen, så skicka gärna in din ansökan så snart
          som möjligt.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <ApplicationModal />
        <Button
          size="lg"
          variant="outline"
          className="w-full sm:w-auto border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
          asChild
        >
          <a href="mailto:jobb@johnie.se?subject=Ansökan: Personlig Assistent">
            <Mail />
            Skicka via e-post
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
