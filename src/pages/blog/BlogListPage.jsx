import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Calendar, Eye, ChevronRight, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { postService } from '../../services/postService.js';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const PER_PAGE = 9;

function PostCard({ post }) {
  return (
    <Link
      to={`/magazine/${post.slug}`}
      className="card group overflow-hidden hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100">
        <img
          src={post.thumbnailUrl || 'https://placehold.co/600x375?text=Magazine'}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-white">
            {post.category.name}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="mb-2 flex items-center gap-3 text-xs text-ink-400">
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dayjs(post.publishedAt).format('DD/MM/YYYY')}
            </span>
          )}
          {post.viewCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {post.viewCount} lượt xem
            </span>
          )}
        </div>
        <h3 className="mb-2 line-clamp-2 text-base font-bold text-ink-900 transition-colors group-hover:text-brand-primary">
          {post.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
        {post.author?.fullName && (
          <p className="mt-3 text-xs font-medium text-ink-400">Bởi {post.author.fullName}</p>
        )}
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="aspect-[16/10] bg-ink-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded bg-ink-100" />
        <div className="h-3 w-full rounded bg-ink-100" />
        <div className="h-3 w-1/2 rounded bg-ink-100" />
      </div>
    </div>
  );
}

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;

  const apiParams = useMemo(() => {
    const p = { page, size: PER_PAGE };
    if (category) p.category = category;
    if (q) p.q = q;
    return p;
  }, [page, category, q]);

  const { data: catData } = useQuery({
    queryKey: ['post-categories'],
    queryFn: () => postService.categories(),
    staleTime: 60 * 60 * 1000,
  });
  const categories = catData?.data?.items ?? [];

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['posts', apiParams],
    queryFn: () => postService.list(apiParams),
    placeholderData: keepPreviousData,
  });

  const posts = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const updateParams = (patch, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) next.delete(k);
      else next.set(k, v);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = new FormData(e.currentTarget).get('q')?.toString().trim() ?? '';
    updateParams({ q: value });
  };

  const handlePage = (p) => {
    updateParams({ page: String(p) }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ═══ Hero banner "Tạp chí" ═══ */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">Tạp chí</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">Tạp chí xe</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Tạp chí xe hơi</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Kinh nghiệm thuê xe, đánh giá xe và tin ưu đãi mới nhất từ OtoRent.
          </p>
        </div>
      </section>

      {/* ═══ Body ═══ */}
      <div className="container-app py-8">
        {/* Category filter + search */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParams({ category: '' })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                !category
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
              }`}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateParams({ category: c.slug })}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  category === c.slug
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Tìm bài viết..."
              className="input pl-9"
            />
          </form>
        </div>

        {q && (
          <p className="mb-4 text-sm text-ink-500">
            Kết quả cho “<span className="font-semibold text-ink-900">{q}</span>” — {total} bài viết
          </p>
        )}

        {isError ? (
          <EmptyState title="Không tải được bài viết" description="Vui lòng thử lại sau." />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="Chưa có bài viết"
            description="Không tìm thấy bài viết phù hợp với bộ lọc của bạn."
          />
        ) : (
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${
              isFetching ? 'opacity-60 transition-opacity' : ''
            }`}
          >
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePage} />
          </div>
        )}
      </div>
    </div>
  );
}
