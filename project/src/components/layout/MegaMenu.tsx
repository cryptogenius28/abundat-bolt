import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getCategories, Category } from '../../lib/supabase';

interface MegaMenuProps {
  onClose: () => void;
}

export function MegaMenu({ onClose }: MegaMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-ink-200 shadow-xl mt-0 rounded-b-lg overflow-hidden">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-5 gap-6">
          {/* Categories grid */}
          <div className="col-span-4 grid grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.id}>
                <Link
                  to={`/category/${category.slug}`}
                  className="flex items-center gap-1 text-ink-900 font-semibold mb-3 hover:text-brand"
                  onClick={onClose}
                >
                  {category.name}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Featured product */}
          <div className="col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-3">
              Featured
            </p>
            <div className="bg-ink-50 rounded-lg p-4">
              <Link to="/shop?featured=true" onClick={onClose}>
                <div className="aspect-square bg-gradient-to-br from-brand/20 to-brand/5 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-brand text-4xl font-bold">40%</span>
                </div>
                <p className="font-semibold text-ink-900 mb-1">Flash Sale</p>
                <p className="text-sm text-ink-500">Up to 40% off select items</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
