// src/pages/admin/PostFormPage.jsx
// Admin blog create/edit (UC-56). One form for both /admin/posts/new and
// /admin/posts/:id. Markdown content with a live prose preview (no heavy RTE
// dependency — @tailwindcss/typography renders the preview).
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Eye, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminPostService,
  adminCategoryService,
  adminTagService,
} from '../../services/adminService.js';
import { renderMarkdown } from '../../utils/markdown.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Select from '../../components/ui/Select.jsx';
import Switch from '../../components/ui/Switch.jsx';
import Loading from '../../components/common/Loading.jsx';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Đã đăng' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
];

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  thumbnailUrl: '',
  categoryId: '',
  status: 'DRAFT',
  isFeatured: false,
};

const unwrap = (res) => res?.data ?? res ?? {};

export default function PostFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyForm);
  const [selectedTags, setSelectedTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('write'); // write | preview
  const [loadedId, setLoadedId] = useState(null);

  // Taxonomies for the selectors.
  const { data: catData } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => adminCategoryService.list(),
  });
  const { data: tagData } = useQuery({
    queryKey: ['adminTags'],
    queryFn: () => adminTagService.list(),
  });
  const categories = unwrap(catData).items ?? [];
  const tags = unwrap(tagData).items ?? [];

  // Existing post when editing.
  const { data: postData, isLoading: loadingPost } = useQuery({
    queryKey: ['adminPost', id],
    queryFn: () => adminPostService.detail(id),
    enabled: isEdit,
  });

  // Populate the form once the post arrives, without an effect. Syncing
  // derived state during render (guarded by the loaded id) is React's
  // recommended pattern over setState-in-effect.
  if (isEdit && postData) {
    const post = unwrap(postData).post ?? unwrap(postData);
    if (post?.id && post.id !== loadedId) {
      setLoadedId(post.id);
      setForm({
        title: post.title ?? '',
        slug: post.slug ?? '',
        excerpt: post.excerpt ?? '',
        content: post.content ?? '',
        thumbnailUrl: post.thumbnailUrl ?? '',
        categoryId: post.categoryId ? String(post.categoryId) : '',
        status: post.status ?? 'DRAFT',
        isFeatured: Boolean(post.isFeatured),
      });
      setSelectedTags((post.tags ?? []).map((t) => t.id));
    }
  }

  const previewHtml = useMemo(() => renderMarkdown(form.content), [form.content]);

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const buildPayload = () => {
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content,
      thumbnailUrl: form.thumbnailUrl.trim(),
      status: form.status,
      isFeatured: form.isFeatured,
      tags: selectedTags,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();
    if (form.categoryId) payload.categoryId = Number(form.categoryId);
    return payload;
  };

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 3) next.title = 'Tiêu đề tối thiểu 3 ký tự';
    if (!form.content.trim()) next.content = 'Nội dung không được để trống';
    if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug))
      next.slug = 'Slug phải ở dạng kebab-case (chữ thường, nối bằng dấu -)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? adminPostService.update(id, payload) : adminPostService.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết');
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['adminPost', id] });
      navigate('/admin/posts');
    },
    onError: (err) => {
      const details = err?.errors || err?.details;
      if (Array.isArray(details)) {
        const mapped = {};
        details.forEach((d) => {
          const key = d.path?.[d.path.length - 1] ?? d.field;
          if (key) mapped[key] = d.message;
        });
        setErrors((prev) => ({ ...prev, ...mapped }));
      }
      toast.error(err?.message || 'Không thể lưu bài viết');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      setTab('write');
      return;
    }
    saveMutation.mutate(buildPayload());
  };

  if (isEdit && loadingPost) {
    return (
      <div className="p-8">
        <Loading />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-700">
            {isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/posts')}
          >
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={saveMutation.isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo bài viết'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <Input
              label="Tiêu đề"
              value={form.title}
              onChange={setField('title')}
              placeholder="Nhập tiêu đề bài viết"
              error={errors.title}
            />
            <div className="mt-4">
              <Input
                label="Slug (tùy chọn)"
                value={form.slug}
                onChange={setField('slug')}
                placeholder="tu-dong-tao-tu-tieu-de"
                error={errors.slug}
                helperText="Để trống sẽ tự sinh từ tiêu đề."
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Tóm tắt"
                value={form.excerpt}
                onChange={setField('excerpt')}
                rows={2}
                placeholder="Mô tả ngắn hiển thị ở danh sách bài viết"
                error={errors.excerpt}
              />
            </div>
          </div>

          {/* Content editor with write/preview tabs */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
              <label className="text-sm font-medium text-ink-700">Nội dung</label>
              <div className="flex gap-1 rounded-lg bg-ink-50 p-1">
                <button
                  type="button"
                  onClick={() => setTab('write')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    tab === 'write'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-ink-500'
                  }`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Soạn thảo
                </button>
                <button
                  type="button"
                  onClick={() => setTab('preview')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    tab === 'preview'
                      ? 'bg-white text-brand-primary shadow-sm'
                      : 'text-ink-500'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Xem trước
                </button>
              </div>
            </div>
            <div className="p-5">
              {tab === 'write' ? (
                <>
                  <textarea
                    value={form.content}
                    onChange={setField('content')}
                    rows={18}
                    placeholder="Viết nội dung bằng Markdown…"
                    className="input resize-y font-mono text-sm"
                  />
                  {errors.content && (
                    <p className="mt-1 text-xs text-danger">{errors.content}</p>
                  )}
                  <p className="mt-2 text-xs text-ink-300">
                    Hỗ trợ Markdown: # tiêu đề, **đậm**, *nghiêng*, - danh sách, [link](url).
                  </p>
                </>
              ) : previewHtml ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              ) : (
                <p className="text-sm text-ink-300">Chưa có nội dung để xem trước.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Xuất bản</h2>
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={setField('status')}
              options={STATUS_OPTIONS}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">Bài nổi bật</span>
              <Switch
                enabled={form.isFeatured}
                onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Phân loại</h2>
            <Select
              label="Danh mục"
              value={form.categoryId}
              onChange={setField('categoryId')}
              placeholder="— Chọn danh mục —"
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Thẻ</label>
              {tags.length === 0 ? (
                <p className="text-xs text-ink-300">Chưa có thẻ nào.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const active = selectedTags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-brand-primary text-white'
                            : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Ảnh bìa</h2>
            <Input
              value={form.thumbnailUrl}
              onChange={setField('thumbnailUrl')}
              placeholder="https://…"
              error={errors.thumbnailUrl}
            />
            {form.thumbnailUrl && (
              <img
                src={form.thumbnailUrl}
                alt="Xem trước ảnh bìa"
                className="mt-3 h-36 w-full rounded-xl object-cover ring-1 ring-ink-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
