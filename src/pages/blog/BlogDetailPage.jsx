import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Eye, ChevronRight, User, Tag as TagIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { postService } from '../../services/postService.js';
import CommentSection from '../../components/blog/CommentSection.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

function RelatedCard({ post }) {
  return (
    <Link
      to={`/magazine/${post.slug}`}
      className="card group flex gap-3 overflow-hidden p-3 hover:shadow-card-hover transition-shadow"
    >
      <div className="aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-100">
        <img
          src={post.thumbnailUrl || 'https://placehold.co/160x160?text=OtoRent'}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-primary">
          {post.title}
        </h4>
        {post.publishedAt && (
          <p className="mt-1 text-xs text-ink-400">
            {dayjs(post.publishedAt).format('DD/MM/YYYY')}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postService.detail(slug),
    enabled: Boolean(slug),
  });

  const post = data?.data?.post ?? null;

  const { data: relatedData } = useQuery({
    queryKey: ['post-related', post?.id],
    queryFn: () => postService.related(post.id),
    enabled: Boolean(post?.id),
  });
  const related = relatedData?.data?.items ?? [];

  // DB content is plain prose — split on blank lines into paragraphs.
  const paragraphs = useMemo(
    () => (post?.content || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
    [post?.content]
  );

  if (isLoading) {
    return (
      <div className="container-app py-12">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-3/4 rounded bg-ink-100" />
          <div className="h-4 w-1/3 rounded bg-ink-100" />
          <div className="aspect-[16/9] w-full rounded-2xl bg-ink-100" />
          <div className="h-4 w-full rounded bg-ink-100" />
          <div className="h-4 w-full rounded bg-ink-100" />
          <div className="h-4 w-2/3 rounded bg-ink-100" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="container-app py-12">
        <EmptyState
          title="Không tìm thấy bài viết"
          description="Bài viết có thể đã bị gỡ hoặc chưa được xuất bản."
          action={
            <Link to="/magazine" className="btn btn-primary btn-sm">
              Về trang tạp chí
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-ink-900">
        {post.thumbnailUrl && (
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/80 to-ink-900/40" />
        <div className="container-app relative z-10 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/magazine" className="transition hover:text-white">
              Tạp chí
            </Link>
          </nav>
          {post.category && (
            <Link
              to={`/magazine?category=${post.category.slug}`}
              className="mb-3 inline-block rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white"
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/70">
            {post.author?.fullName && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.author.fullName}
              </span>
            )}
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {dayjs(post.publishedAt).format('DD/MM/YYYY')}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {post.viewCount} lượt xem
            </span>
          </div>
        </div>
      </section>

      {/* ═══ Body ═══ */}
      <div className="container-app py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          {/* Article */}
          <article className="min-w-0">
            {post.excerpt && (
              <p className="mb-6 border-l-4 border-brand-primary pl-4 text-lg font-medium italic text-ink-700">
                {post.excerpt}
              </p>
            )}
            <div className="prose prose-lg max-w-none text-ink-700">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-6">
                <TagIcon className="h-4 w-4 text-ink-400" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to={`/magazine?tag=${tag.slug}`}
                    className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 ring-1 ring-ink-100 transition hover:bg-ink-100"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Comments (UC-24) */}
            <CommentSection postId={post.id} />
          </article>

          {/* Sidebar — related */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="mb-4 text-lg font-bold text-ink-900">Bài liên quan</h2>
            {related.length === 0 ? (
              <p className="text-sm text-ink-400">Chưa có bài viết liên quan.</p>
            ) : (
              <div className="space-y-3">
                {related.map((r) => (
                  <RelatedCard key={r.id} post={r} />
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
