import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ArrowRight } from 'lucide-react';
import dayjs from 'dayjs';
import { postService } from '../../services/postService.js';

/**
 * Section 10 — Magazine articles
 * 3 bài blog mới nhất (mock data cho đến khi API thật ở T5 Day 21)
 */
export default function MagazineGrid() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postService
      .list({ size: 3 })
      .then((res) => {
        setPosts(res.data?.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-14 md:py-20 bg-ink-50">
        <div className="container-app">
          <div className="text-center mb-10">
            <p className="text-brand-primary font-semibold text-sm mb-1">Tạp chí xe</p>
            <h2 className="text-2xl md:text-3xl font-bold text-ink-900">Tạp chí xe hơi</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-ink-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-ink-100 rounded w-3/4" />
                  <div className="h-3 bg-ink-100 rounded w-full" />
                  <div className="h-3 bg-ink-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!posts.length) return null;

  return (
    <section className="py-14 md:py-20 bg-ink-50">
      <div className="container-app">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-primary font-semibold text-sm mb-1">Tạp chí xe</p>
            <h2 className="text-2xl md:text-3xl font-bold text-ink-900">Tạp chí xe hơi</h2>
          </div>
          <Link
            to="/magazine"
            className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-primary-dark transition"
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/magazine/${post.slug}`}
              className="card group overflow-hidden hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="aspect-[16/10] overflow-hidden bg-ink-100">
                <img
                  src={post.thumbnailUrl || 'https://placehold.co/600x375?text=Magazine'}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-ink-400 mb-2">
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {dayjs(post.publishedAt).format('DD/MM/YYYY')}
                    </span>
                  )}
                  {post.viewCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.viewCount} lượt xem
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-ink-900 mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-ink-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6 md:hidden">
          <Link to="/magazine" className="btn btn-outline btn-sm">
            Xem tất cả bài viết
          </Link>
        </div>
      </div>
    </section>
  );
}
