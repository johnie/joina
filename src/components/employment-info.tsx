import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SKATTEVERKET_PERSONBEVIS_URL =
  'https://skatteverket.se/privat/folkbokforing/bestallpersonbevis.4.18e1b10334ebe8bc80001711.html';

const POLISEN_BELASTNINGSREGISTER_URL =
  'https://polisen.se/tjanster-tillstand/belastningsregistret/arbete-i-hemmet-med-aldre-och-personer-med-funktionsnedsattning-e-tjanst/';

export function EmploymentInfo() {
  return (
    <Card className="not-prose my-8">
      <CardHeader>
        <CardTitle className="font-heading text-amber-600 text-xl">
          Vid eventuell anställning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300">
          <p>
            För anställning hos oss på God Omsorg behöver du ha ett BankID och
            godkänner att använda ditt BankID i tjänsten. En förutsättning för
            att påbörja en anställning hos oss är att du som söker kan uppvisa:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Giltig ID-handling</li>
            <li>
              Giltigt{' '}
              <a
                className="text-teal-600 underline underline-offset-4 hover:text-teal-500 dark:text-teal-400"
                href={SKATTEVERKET_PERSONBEVIS_URL}
                rel="noopener noreferrer"
                target="_blank"
              >
                personbevis från Skatteverket
              </a>
            </li>
            <li>
              Eventuella dokument som styrker rätten till arbete i Sverige
            </li>
          </ul>
          <p>
            På grund av att tjänsten kan omfatta ensamarbete, nattarbete och
            arbetsuppgifter som enligt Arbetsmiljöverkets föreskrifter (AFS
            2012:3) inte får utföras av minderåriga, måste du ha fyllt 18 år för
            att arbeta som personlig assistent hos oss.
          </p>
        </div>

        <div className="space-y-3 border-stone-200 border-t pt-4 dark:border-stone-700">
          <h3 className="font-heading font-semibold text-amber-600">
            Utdrag ur belastningsregistret
          </h3>
          <p className="text-sm text-stone-700 dark:text-stone-300">
            För att arbeta med denna kund måste du uppvisa utdrag ur
            belastningsregistret. Det är viktigt att du redan nu beställer ett
            utdrag från Polisen, då handläggningstiden kan variera. Du beställer
            enkelt med BankID via länken nedan.
          </p>
          <Button
            asChild
            className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-950"
            size="sm"
            variant="outline"
          >
            <a
              href={POLISEN_BELASTNINGSREGISTER_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Beställ utdrag från Polisen
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
