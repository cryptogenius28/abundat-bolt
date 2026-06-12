import { useEffect } from 'react';
import { ShieldCheck, Truck, Users, Package } from 'lucide-react';

export function AboutPage() {
  useEffect(() => {
    document.title = 'About Us | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Our Story
        </h1>
        <p className="text-lg text-ink-600">
          Quality products, unbeatable prices, and exceptional service since 2020.
        </p>
      </div>

      {/* Mission */}
      <div className="prose max-w-none mb-16">
        <h2 className="text-2xl font-heading font-bold mb-4">Our Mission</h2>
        <p className="text-ink-600 mb-4">
          At Abundant Merchandise, we believe everyone deserves access to quality products at fair prices.
          We started with a simple idea: create an online store that offers the best selection,
          competitive pricing, and outstanding customer service.
        </p>
        <p className="text-ink-600 mb-4">
          Our hybrid fulfillment model combines the efficiency of our Reno, NV warehouse with
          the expansive selection of dropshipping partners, giving you access to thousands of
          products with fast shipping times.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Package, value: '50,000+', label: 'Products' },
          { icon: Users, value: '10,000+', label: 'Customers' },
          { icon: Truck, value: '99%', label: 'On-time Delivery' },
          { icon: ShieldCheck, value: '30-day', label: 'Returns' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-6 bg-ink-50 rounded-xl">
            <stat.icon className="w-8 h-8 text-brand mx-auto mb-2" />
            <p className="text-2xl font-bold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-heading font-bold mb-8 text-center">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Quality First',
              description: 'Every product is carefully vetted to ensure it meets our high standards.',
            },
            {
              title: 'Customer Focus',
              description: 'Your satisfaction is our top priority. We are here 24/7 to help.',
            },
            {
              title: 'Honest Pricing',
              description: 'No hidden fees, no surprises. What you see is what you pay.',
            },
          ].map((value) => (
            <div key={value.title} className="border border-ink-200 rounded-xl p-6">
              <h3 className="font-semibold text-ink-900 mb-2">{value.title}</h3>
              <p className="text-sm text-ink-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="bg-ink-900 text-white rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Our Headquarters</h3>
        <p className="text-ink-300">
          123 Commerce Street<br />
          Reno, NV 89501<br />
          United States
        </p>
      </div>
    </div>
  );
}
