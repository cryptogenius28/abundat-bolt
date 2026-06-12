export function AnnouncementBar() {
  return (
    <div className="bg-ink-900 text-white text-xs py-2 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span>🚚</span>
            <span>Free shipping on orders over $49</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>↩</span>
            <span>30-day returns</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-brand font-semibold">
          <span>⚡</span>
          <span>FLASH SALE — up to 40% off</span>
        </div>
      </div>
    </div>
  );
}
