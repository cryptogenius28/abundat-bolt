import { useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { faqs } from '../../data/mockData';

export function FAQPage() {
  useEffect(() => {
    document.title = 'FAQs | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-ink-600">
          Find answers to common questions about ordering, shipping, returns, and more.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id} className="bg-white border rounded-lg px-6">
            <AccordionTrigger className="text-left font-semibold">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-ink-600">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
