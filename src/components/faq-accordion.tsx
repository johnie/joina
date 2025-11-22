import { allQnas } from 'content-collections';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FaqAccordion() {
  const sortedQnas = allQnas.sort((a, b) => a.order - b.order);

  return (
    <Accordion className="not-prose w-full" collapsible type="single">
      {sortedQnas.map((item, index) => (
        <AccordionItem key={item._meta.path} value={`item-${index + 1}`}>
          <AccordionTrigger className="text-left font-bold">
            {item.title}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
