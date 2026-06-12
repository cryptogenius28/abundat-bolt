import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Los Angeles, CA',
    rating: 5,
    quote: 'Amazing selection and prices! My order arrived faster than expected, and the quality exceeded my expectations. Will definitely be shopping here again.',
  },
  {
    id: 2,
    name: 'James K.',
    location: 'Austin, TX',
    rating: 5,
    quote: 'The customer service is outstanding. Had an issue with my order and they resolved it immediately. Really impressed with the professionalism.',
  },
  {
    id: 3,
    name: 'Emily R.',
    location: 'Seattle, WA',
    rating: 5,
    quote: 'Found everything I needed for my home renovation at great prices. The product descriptions were accurate and helpful. Highly recommend!',
  },
];

export function Testimonials() {
  return (
    <section className="section-padding bg-ink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
            Reviews
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
            What Our Customers Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-xl border border-ink-200"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= testimonial.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-ink-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-ink-700 mb-4 italic">"{testimonial.quote}"</p>
              <p className="font-semibold text-ink-900">{testimonial.name}</p>
              <p className="text-sm text-ink-500">{testimonial.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
