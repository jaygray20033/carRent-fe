// src/pages/admin/VehicleModelListPage.jsx
// Admin vehicle-model management (Day 32 — UC-53). List + create/edit modal +
// delete (blocked by the BE when vehicles still reference the model).
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminVehicleModelService } from '../../services/adminService.js';
import { brandService } from '../../services/brandService.js';
import { categoryService } from '../../services/categoryService.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const TRANSMISSION_OPTIONS = [
  { value: 'AUTO', label: 'Số tự động' },
  { value: 'MANUAL', label: 'Số sàn' },
];
const FUEL_OPTIONS = [
  { value: 'GASOLINE', label: 'Xăng' },
  { value: 'DIESEL', label: 'Dầu' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ELECTRIC', label: 'Điện' },
];

// Auto kebab-case slug from a name (Vietnamese diacritics stripped).
const slugify = (str) =>
  str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptyForm = {
  name: '',
  slug: '',
  brandId: '',
  categoryId: '',
  seats: '',
  transmission: 'AUTO',
  fuelType: 'GASOLINE',
  description: '',
};

function ModelFormModal({ open, model, brandOptions, categoryOptions, onClose, onSaved }) {
  const isEdit = Boolean(model);
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [loadedId, setLoadedId] = useState(null);

  // Populate on edit / reset on create — synced during render, guarded by id.
  const targetId = model?.id ?? 'new';
  if (targetId !== loadedId) {
    setLoadedId(targetId);
    if (model) {
      setForm({
        name: model.name ?? '',
        slug: model.slug ?? '',
        brandId: model.brandId != null ? String(model.brandId) : '',
        categoryId: model.categoryId != null ? String(model.categoryId) : '',
        seats: model.seats != null ? String(model.seats) : '',
        transmission: model.transmission ?? 'AUTO',
        fuelType: model.fuelType ?? 'GASOLINE',
        description: model.description ?? '',
      });
      setSlugTouched(true);
    } else {
      setForm(emptyForm);
      setSlugTouched(false);
    }
    setErrors({});
  }

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onNameChange = (e) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 1) next.name = 'Nhập tên dòng xe';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) next.slug = 'Slug dạng kebab-case';
    if (!form.brandId) next.brandId = 'Chọn hãng xe';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      brandId: Number(form.brandId),
      transmission: form.transmission,
      fuelType: form.fuelType,
    };
    if (form.categoryId) payload.categoryId = Number(form.categoryId);
    if (form.seats !== '') payload.seats = Number(form.seats);
    if (form.description.trim()) payload.description = form.description.trim();
    return payload;
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? adminVehicleModelService.update(model.id, payload) : adminVehicleModelService.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Đã cập nhật dòng xe' : 'Đã tạo dòng xe');
      queryClient.invalidateQueries({ queryKey: ['adminVehicleModels'] });
      onSaved?.();
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
      toast.error(err?.message || 'Không thể lưu dòng xe');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(buildPayload());
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Sửa dòng xe' : 'Thêm dòng xe'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên dòng xe" value={form.name} onChange={onNameChange} error={errors.name} placeholder="VD: Mercedes C300" />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setField('slug')(e);
          }}
          error={errors.slug}
          className="font-mono"
          helperText="Dùng cho URL. Tự sinh từ tên."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Hãng xe"
            value={form.brandId}
            onChange={setField('brandId')}
            options={brandOptions}
            error={errors.brandId}
          />
          <Select
            label="Danh mục"
            value={form.categoryId}
            onChange={setField('categoryId')}
            options={categoryOptions}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Số chỗ" type="number" min="2" max="50" value={form.seats} onChange={setField('seats')} placeholder="VD: 5" />
          <Select label="Hộp số" value={form.transmission} onChange={setField('transmission')} options={TRANSMISSION_OPTIONS} />
          <Select label="Nhiên liệu" value={form.fuelType} onChange={setField('fuelType')} options={FUEL_OPTIONS} />
        </div>
        <Textarea label="Mô tả" value={form.description} onChange={setField('description')} rows={3} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={saveMutation.isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo dòng xe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function VehicleModelListPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminVehicleModels', searchTerm, page],
    queryFn: () =>
      adminVehicleModelService.list({
        page,
        limit: PAGE_SIZE,
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const { data: brandData } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.list() });
  const { data: categoryData } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });

  const brandOptions = [
    { value: '', label: 'Chọn hãng…' },
    ...listOf(brandData).map((b) => ({ value: String(b.id), label: b.name })),
  ];
  const categoryOptions = [
    { value: '', label: 'Không phân loại' },
    ...listOf(categoryData).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const deleteMutation = useMutation({
    mutationFn: (id) => adminVehicleModelService.remove(id),
    onSuccess: () => {
      toast.success('Đã xóa dòng xe');
      queryClient.invalidateQueries({ queryKey: ['adminVehicleModels'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể xóa dòng xe'),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(q.trim());
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (model) => {
    setEditing(model);
    setModalOpen(true);
  };
  const handleDelete = (m) => {
    if (window.confirm(`Xóa dòng xe "${m.name}"?`)) deleteMutation.mutate(m.id);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Quản lý dòng xe</h1>
        <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Thêm dòng xe
        </Button>
      </div>

      <form onSubmit={handleSearch} className="mb-4 w-full sm:w-72">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên / hãng…"
          leftIcon={<Search className="h-4 w-4" />}
        />
      </form>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Chưa có dòng xe" description="Bắt đầu bằng cách thêm dòng xe mới." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Tên</th>
                  <th className="px-4 py-3 font-medium">Hãng</th>
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 font-medium">Số chỗ</th>
                  <th className="px-4 py-3 font-medium">Số xe</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-700">{m.name}</p>
                      <p className="font-mono text-xs text-ink-300">{m.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{m.brand?.name || '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{m.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{m.seats ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-500">{m._count?.vehicles ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(m)}
                          title="Sửa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
                          title="Xóa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger/5 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ModelFormModal
        open={modalOpen}
        model={editing}
        brandOptions={brandOptions}
        categoryOptions={categoryOptions}
        onClose={() => setModalOpen(false)}
        onSaved={() => setModalOpen(false)}
      />
    </div>
  );
}
