import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../../data/mockData';

export function BlogPage() {
  useEffect(() => {
    document.title = 'Blog | Abundant Merchandise';
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">
          Blog
        </h1>
        <p className="text-ink-600">
          Tips, inspiration, and product highlights from the Abundant Merchandise team.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group bg-white border border-ink-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 text-xs text-ink-500 mb-2">
                <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                  {post.category}
                </span>
                <span>{post.date}</span>
              </div>
              <h2 className="font-semibold text-ink-900 mb-2 group-hover:text-brand transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-ink-500 line-clamp-2">{post.excerpt}</p>
              <p className="text-xs text-ink-400 mt-3">{post.readTime}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
