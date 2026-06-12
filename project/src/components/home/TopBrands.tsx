const brands = [
  'Samsung',
  'Apple',
  'Sony',
  'Nike',
  'LEGO',
  'Bosch',
  "L'Oréal",
  'WeatherTech',
];

export function TopBrands() {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
            Our Partners
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
            Trusted Brands
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left">
            {[...brands, ...brands].map((brand, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-6"
              >
                <div className="px-8 py-4 border border-ink-200 rounded-lg bg-white">
                  <span className="text-lg font-heading font-semibold text-ink-600 whitespace-nowrap">
                    {brand}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
