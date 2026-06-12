import { Link } from 'react-router-dom';
import { ChevronRight, Hop as Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-ink-500 py-4">
      <Link
        to="/"
        className="hover:text-brand transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-brand transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-ink-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
