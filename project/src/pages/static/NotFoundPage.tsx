import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hop as Home, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';

export function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page Not Found | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-8xl font-heading font-bold text-brand mb-4">404</div>
      <h1 className="text-2xl font-heading font-bold mb-4">Page Not Found</h1>
      <p className="text-ink-500 mb-8">
        Looks like the page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/shop">
            <Search className="w-4 h-4 mr-2" />
            Browse Products
          </Link>
        </Button>
      </div>
    </div>
  );
}
