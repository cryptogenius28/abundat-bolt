import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { blogPosts } from '../../data/mockData';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Abundant Merchandise`;
    }
  }, [post]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Link to="/blog" className="text-brand hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  const otherPosts = blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        to="/blog"
        className="inline-flex items-center gap-1 text-sm text-ink-600 hover:text-brand mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      <article className="prose prose-ink max-w-none">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 text-xs text-ink-500 mb-4">
            <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-ink-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-ink-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {post.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>
        </header>

        {/* Featured image */}
        <img
          src={post.image}
          alt={post.title}
          className="w-full aspect-video object-cover rounded-xl mb-8"
        />

        {/* Content */}
        <div
          className="text-ink-600 leading-relaxed [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
        />
      </article>

      {/* Related posts */}
      {otherPosts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-heading font-bold mb-6">Related Posts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {otherPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.slug}`}
                className="group"
              >
                <div className="aspect-video rounded-lg overflow-hidden mb-3">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-semibold text-ink-900 group-hover:text-brand transition-colors">
                  {relatedPost.title}
                </h3>
                <p className="text-xs text-ink-400 mt-1">{relatedPost.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
