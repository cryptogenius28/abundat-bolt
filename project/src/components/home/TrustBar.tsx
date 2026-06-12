import { Truck, RotateCcw, ShieldCheck, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Orders $49+',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Hassle-free',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Checkout',
    description: '256-bit encrypted',
  },
  {
    icon: MessageCircle,
    title: '24/7 Support',
    description: 'Always here',
  },
];

export function TrustBar() {
  return (
    <div className="bg-ink-100 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-ink-900 text-sm">
                  {feature.title}
                </p>
                <p className="text-xs text-ink-500">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
