import { useEffect } from 'react';
import { Truck, RotateCcw, MapPin } from 'lucide-react';

export function ShippingPage() {
  useEffect(() => {
    document.title = 'Shipping & Returns | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Shipping & Returns
        </h1>
        <p className="text-ink-600">
          Everything you need to know about getting your order and returning items.
        </p>
      </div>

      {/* Shipping */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Truck className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-heading font-bold">Shipping Policy</h2>
        </div>

        <div className="prose prose-ink max-w-none">
          <p className="text-ink-600 mb-6">
            We offer fast, reliable shipping across the United States. Orders are processed
            within 1-2 business days and shipped from our Reno, NV warehouse or directly from
            our trusted supplier partners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="border border-ink-200 rounded-xl p-6">
            <h3 className="font-semibold text-ink-900 mb-3">Standard Shipping</h3>
            <p className="text-sm text-ink-600 mb-2">5-7 business days</p>
            <p className="text-sm text-ink-600">
              <strong>Free</strong> on orders $49+
              <br />
              $5.99 flat rate for orders under $49
            </p>
          </div>
          <div className="border border-ink-200 rounded-xl p-6">
            <h3 className="font-semibold text-ink-900 mb-3">Express Shipping</h3>
            <p className="text-sm text-ink-600 mb-2">2-3 business days</p>
            <p className="text-sm text-ink-600">
              $12.99 flat rate
              <br />
              <span className="text-ink-400">Available for all products</span>
            </p>
          </div>
          <div className="border border-ink-200 rounded-xl p-6">
            <h3 className="font-semibold text-ink-900 mb-3">Overnight Shipping</h3>
            <p className="text-sm text-ink-600 mb-2">1 business day</p>
            <p className="text-sm text-ink-600">
              $24.99 flat rate
              <br />
              <span className="text-ink-400">Order by 2 PM PT</span>
            </p>
          </div>
          <div className="border border-ink-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-brand" />
              <h3 className="font-semibold text-ink-900">Warehouse vs Dropship</h3>
            </div>
            <p className="text-sm text-ink-600">
              <strong>Warehouse items:</strong> Ships in 2-3 days from Reno
              <br />
              <strong>Dropship items:</strong> Ships in 3-7 days from supplier
            </p>
          </div>
        </div>
      </section>

      {/* Returns */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-heading font-bold">Return Policy</h2>
        </div>

        <div className="prose prose-ink max-w-none mb-6">
          <p className="text-ink-600">
            We want you to be completely satisfied with your purchase. If you are not happy
            with your order, we offer a hassle-free 30-day return policy.
          </p>
        </div>

        <div className="bg-ink-50 rounded-xl p-6 space-y-4">
          {[
            'Items must be returned within 30 days of delivery',
            'Products must be in original condition with all tags attached',
            'Original packaging is required for returns',
            'Some items (personal care, intimate items) cannot be returned for hygiene reasons',
            'Refunds are processed within 5-7 business days of receiving your return',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-ink-600">
              <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-brand font-semibold">{i + 1}</span>
              </div>
              {item}
            </div>
          ))}
        </div>

        <p className="text-sm text-ink-500 mt-6">
          To initiate a return, please contact our customer service team at
          <a href="mailto:returns@abundantmerchandise.com" className="text-brand hover:underline">
            {' '}returns@abundantmerchandise.com
          </a>
          {' '}with your order number and reason for return.
        </p>
      </section>
    </div>
  );
}
