// src/pages/admin/VehicleFormPage.jsx
// Admin vehicle create/edit (Day 32 — UC-53). One form for /admin/vehicles/new
// and /admin/vehicles/:id. Mirrors createVehicleSchema on the BE (kebab slug,
// required name/plate/year/pricePerDay/brand). Images are uploaded separately
// via the multipart endpoint after the vehicle exists.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Upload, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  adminVehicleService,
  adminVehicleModelService,
} from '../../services/adminService.js';
import { brandService } from '../../services/brandService.js';
import { categoryService } from '../../services/categoryService.js';
import { stationService } from '../../services/stationService.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Switch from '../../components/ui/Switch.jsx';
import Loading from '../../components/common/Loading.jsx';

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
const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'RETIRED', label: 'Ngừng dùng' },
];

const CURRENT_YEAR = new Date().getFullYear();

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
  modelId: '',
  categoryId: '',
  stationId: '',
  modelYear: String(CURRENT_YEAR),
  licensePlate: '',
  color: '',
  seats: '',
  transmission: 'AUTO',
  fuelType: 'GASOLINE',
  pricePerDay: '',
  pricePerMonth: '',
  depositAmount: '',
  status: 'AVAILABLE',
  featuredTag: '',
  isFeatured: false,
  description: '',
};

export default function VehicleFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [loadedId, setLoadedId] = useState(null);
  const [files, setFiles] = useState([]); // File[] pending upload
  const [existingImages, setExistingImages] = useState([]);

  const { data: vehicleData, isLoading: loadingVehicle } = useQuery({
    queryKey: ['adminVehicle', id],
    queryFn: () => adminVehicleService.detail(id),
    enabled: isEdit,
  });

  // Option sources.
  const { data: brandData } = useQuery({ queryKey: ['brands'], queryFn: () => brandService.list() });
  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
  });
  const { data: stationData } = useQuery({
    queryKey: ['stations', 'all'],
    queryFn: () => stationService.list({ size: 100 }),
  });
  const { data: modelData } = useQuery({
    queryKey: ['adminVehicleModels', 'all'],
    queryFn: () => adminVehicleModelService.list({ limit: 100 }),
  });

  const brandOptions = [
    { value: '', label: 'Chọn hãng…' },
    ...listOf(brandData).map((b) => ({ value: String(b.id), label: b.name })),
  ];
  const categoryOptions = [
    { value: '', label: 'Không phân loại' },
    ...listOf(categoryData).map((c) => ({ value: String(c.id), label: c.name })),
  ];
  const stationOptions = [
    { value: '', label: 'Chưa gán trạm' },
    ...listOf(stationData).map((s) => ({ value: String(s.id), label: s.name })),
  ];
  const modelOptions = [
    { value: '', label: 'Không gắn dòng xe' },
    ...listOf(modelData).map((m) => ({ value: String(m.id), label: m.name })),
  ];

  // Populate on edit — synced during render, guarded by loaded id.
  if (isEdit && vehicleData) {
    const v = unwrap(vehicleData).vehicle ?? unwrap(vehicleData);
    if (v?.id && v.id !== loadedId) {
      setLoadedId(v.id);
      setForm({
        name: v.name ?? '',
        slug: v.slug ?? '',
        brandId: v.brandId != null ? String(v.brandId) : '',
        modelId: v.modelId != null ? String(v.modelId) : '',
        categoryId: v.categoryId != null ? String(v.categoryId) : '',
        stationId: v.stationId != null ? String(v.stationId) : '',
        modelYear: v.modelYear != null ? String(v.modelYear) : String(CURRENT_YEAR),
        licensePlate: v.licensePlate ?? '',
        color: v.color ?? '',
        seats: v.seats != null ? String(v.seats) : '',
        transmission: v.transmission ?? 'AUTO',
        fuelType: v.fuelType ?? 'GASOLINE',
        pricePerDay: v.pricePerDay != null ? String(v.pricePerDay) : '',
        pricePerMonth: v.pricePerMonth != null ? String(v.pricePerMonth) : '',
        depositAmount: v.depositAmount != null ? String(v.depositAmount) : '',
        status: STATUS_OPTIONS.some((s) => s.value === v.status) ? v.status : 'AVAILABLE',
        featuredTag: v.featuredTag ?? '',
        isFeatured: Boolean(v.isFeatured),
        description: v.description ?? '',
      });
      setExistingImages(Array.isArray(v.images) ? v.images : []);
      setSlugTouched(true);
    }
  }

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onNameChange = (e) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const onFilesChange = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 10));
    e.target.value = ''; // allow re-picking the same file
  };
  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Tên tối thiểu 2 ký tự';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) next.slug = 'Slug dạng kebab-case';
    if (!form.brandId) next.brandId = 'Chọn hãng xe';
    if (form.licensePlate.trim().length < 4) next.licensePlate = 'Biển số tối thiểu 4 ký tự';

    const year = Number(form.modelYear);
    if (!year || year < 1990 || year > CURRENT_YEAR + 1)
      next.modelYear = `Năm từ 1990 đến ${CURRENT_YEAR + 1}`;

    const price = Number(form.pricePerDay);
    if (!form.pricePerDay || Number.isNaN(price) || price <= 0)
      next.pricePerDay = 'Giá/ngày phải lớn hơn 0';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      brandId: Number(form.brandId),
      modelYear: Number(form.modelYear),
      licensePlate: form.licensePlate.trim(),
      pricePerDay: Number(form.pricePerDay),
      transmission: form.transmission,
      fuelType: form.fuelType,
      status: form.status,
      isFeatured: form.isFeatured,
    };
    if (form.modelId) payload.modelId = Number(form.modelId);
    if (form.categoryId) payload.categoryId = Number(form.categoryId);
    if (form.stationId) payload.stationId = Number(form.stationId);
    if (form.color.trim()) payload.color = form.color.trim();
    if (form.seats !== '') payload.seats = Number(form.seats);
    if (form.pricePerMonth !== '') payload.pricePerMonth = Number(form.pricePerMonth);
    if (form.depositAmount !== '') payload.depositAmount = Number(form.depositAmount);
    if (form.featuredTag.trim()) payload.featuredTag = form.featuredTag.trim();
    if (form.description.trim()) payload.description = form.description.trim();
    return payload;
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const saved = isEdit
        ? await adminVehicleService.update(id, payload)
        : await adminVehicleService.create(payload);
      const vehicle = unwrap(saved).vehicle ?? unwrap(saved);
      // Upload any newly picked images against the (now existing) vehicle.
      if (files.length && vehicle?.id) {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        await adminVehicleService.uploadImages(vehicle.id, fd);
      }
      return vehicle;
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Đã cập nhật xe' : 'Đã tạo xe');
      queryClient.invalidateQueries({ queryKey: ['adminVehicles'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['adminVehicle', id] });
      navigate('/admin/vehicles');
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
      toast.error(err?.message || 'Không thể lưu xe');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(buildPayload());
  };

  if (isEdit && loadingVehicle) {
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
            onClick={() => navigate('/admin/vehicles')}
            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-700">
            {isEdit ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/vehicles')}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={saveMutation.isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo xe'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Thông tin cơ bản</h2>
            <Input
              label="Tên xe"
              value={form.name}
              onChange={onNameChange}
              placeholder="VD: Mercedes C300 AMG 2023"
              error={errors.name}
            />
            <div className="mt-4">
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
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Hãng xe"
                value={form.brandId}
                onChange={setField('brandId')}
                options={brandOptions}
                error={errors.brandId}
              />
              <Select
                label="Dòng xe"
                value={form.modelId}
                onChange={setField('modelId')}
                options={modelOptions}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Danh mục"
                value={form.categoryId}
                onChange={setField('categoryId')}
                options={categoryOptions}
              />
              <Select
                label="Trạm"
                value={form.stationId}
                onChange={setField('stationId')}
                options={stationOptions}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Biển số"
                value={form.licensePlate}
                onChange={setField('licensePlate')}
                placeholder="VD: 30A-123.45"
                error={errors.licensePlate}
                className="font-mono uppercase"
              />
              <Input
                label="Năm sản xuất"
                type="number"
                min="1990"
                max={CURRENT_YEAR + 1}
                value={form.modelYear}
                onChange={setField('modelYear')}
                error={errors.modelYear}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Thông số kỹ thuật</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Màu sắc"
                value={form.color}
                onChange={setField('color')}
                placeholder="VD: Trắng"
              />
              <Input
                label="Số chỗ"
                type="number"
                min="2"
                max="50"
                value={form.seats}
                onChange={setField('seats')}
                placeholder="VD: 5"
              />
              <Select
                label="Hộp số"
                value={form.transmission}
                onChange={setField('transmission')}
                options={TRANSMISSION_OPTIONS}
              />
              <Select
                label="Nhiên liệu"
                value={form.fuelType}
                onChange={setField('fuelType')}
                options={FUEL_OPTIONS}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Mô tả"
                value={form.description}
                onChange={setField('description')}
                rows={4}
              />
            </div>
          </div>

          {/* Images */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Hình ảnh</h2>

            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-medium uppercase text-ink-300">Ảnh hiện có</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {existingImages.map((img) => (
                    <div
                      key={img.id ?? img.url}
                      className="relative overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100"
                    >
                      <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-md bg-brand-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          <Star className="h-2.5 w-2.5" /> Chính
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink-100 px-4 py-8 text-center transition-colors hover:border-brand-primary hover:bg-brand-primary/5">
              <Upload className="mb-2 h-6 w-6 text-ink-300" />
              <span className="text-sm font-medium text-ink-700">Chọn ảnh để tải lên</span>
              <span className="mt-0.5 text-xs text-ink-300">Tối đa 10 ảnh. Ảnh mới thêm sau khi lưu.</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
            </label>

            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {files.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="relative overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100"
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                      className="aspect-video w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute right-1 top-1 rounded-md bg-black/50 p-1 text-white transition-colors hover:bg-danger"
                      title="Bỏ ảnh"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Giá & đặt cọc</h2>
            <Input
              label="Giá / ngày (VND)"
              type="number"
              min="0"
              value={form.pricePerDay}
              onChange={setField('pricePerDay')}
              placeholder="VD: 800000"
              error={errors.pricePerDay}
            />
            <div className="mt-4">
              <Input
                label="Giá / tháng (VND)"
                type="number"
                min="0"
                value={form.pricePerMonth}
                onChange={setField('pricePerMonth')}
                placeholder="Tùy chọn"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Tiền đặt cọc (VND)"
                type="number"
                min="0"
                value={form.depositAmount}
                onChange={setField('depositAmount')}
                placeholder="Tùy chọn"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Trạng thái & nổi bật</h2>
            <Select
              label="Trạng thái"
              value={form.status}
              onChange={setField('status')}
              options={STATUS_OPTIONS}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">Xe nổi bật</span>
              <Switch
                enabled={form.isFeatured}
                onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              />
            </div>
            {form.isFeatured && (
              <div className="mt-4">
                <Input
                  label="Nhãn nổi bật"
                  value={form.featuredTag}
                  onChange={setField('featuredTag')}
                  placeholder="VD: Hot, Mới về"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
