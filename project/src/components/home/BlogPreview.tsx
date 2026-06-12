import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { blogPosts } from '../../data/mockData';

export function BlogPreview() {
  const recentPosts = blogPosts.slice(0, 3);

  return (
    <section className="section-padding bg-ink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-brand mb-2">
            From Our Blog
          </p>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-ink-900">
            Tips & Inspiration
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-xl overflow-hidden border border-ink-200 hover:shadow-lg transition-all"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <span className="text-xs font-medium text-brand uppercase tracking-wide">
                  {post.category}
                </span>
                <h3 className="font-semibold text-ink-900 mt-2 mb-2 group-hover:text-brand transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-ink-500 line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1"
          >
            View all posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
