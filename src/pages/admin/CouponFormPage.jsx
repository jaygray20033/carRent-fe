// src/pages/admin/CouponFormPage.jsx
// Admin coupon create/edit (UC-57). One form for /admin/coupons/new and
// /admin/coupons/:id. Client-side mirror of the BE rules: end_at > start_at,
// PERCENT value ≤ 100, code uppercased.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCouponService } from '../../services/adminService.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Switch from '../../components/ui/Switch.jsx';
import Loading from '../../components/common/Loading.jsx';

const TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Giảm cố định (VND)' },
  { value: 'PERCENT', label: 'Giảm phần trăm (%)' },
  { value: 'FREE_DRIVER', label: 'Miễn phí tài xế' },
];

const APPLIES_OPTIONS = [
  { value: 'ALL', label: 'Tất cả đơn' },
  { value: 'CATEGORY', label: 'Theo danh mục xe' },
  { value: 'MODEL', label: 'Theo dòng xe' },
];

const emptyForm = {
  code: '',
  type: 'FIXED',
  value: '',
  minOrder: '',
  maxDiscount: '',
  maxUse: '',
  maxUsePerUser: '',
  startAt: '',
  endAt: '',
  appliesTo: 'ALL',
  isActive: true,
};

const unwrap = (res) => res?.data ?? res ?? {};

// Convert an ISO date string → value for <input type="datetime-local">.
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

export default function CouponFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loadedId, setLoadedId] = useState(null);

  const { data: couponData, isLoading: loadingCoupon } = useQuery({
    queryKey: ['adminCoupon', id],
    queryFn: () => adminCouponService.detail(id),
    enabled: isEdit,
  });

  // Populate the form once the coupon arrives, without an effect. Syncing
  // derived state during render (guarded by the loaded id) is React's
  // recommended pattern over setState-in-effect.
  if (isEdit && couponData) {
    const c = unwrap(couponData).coupon ?? unwrap(couponData);
    if (c?.id && c.id !== loadedId) {
      setLoadedId(c.id);
      setForm({
        code: c.code ?? '',
        type: c.type ?? 'FIXED',
        value: c.value != null ? String(c.value) : '',
        minOrder: c.minOrder != null ? String(c.minOrder) : '',
        maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : '',
        maxUse: c.maxUse != null ? String(c.maxUse) : '',
        maxUsePerUser: c.maxUsePerUser != null ? String(c.maxUsePerUser) : '',
        startAt: toLocalInput(c.startAt),
        endAt: toLocalInput(c.endAt),
        appliesTo: c.appliesTo ?? 'ALL',
        isActive: Boolean(c.isActive),
      });
    }
  }

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const isPercent = form.type === 'PERCENT';
  const isFreeDriver = form.type === 'FREE_DRIVER';

  const validate = () => {
    const next = {};
    if (form.code.trim().length < 3) next.code = 'Mã tối thiểu 3 ký tự';
    else if (!/^[A-Za-z0-9_-]+$/.test(form.code.trim()))
      next.code = 'Mã chỉ gồm chữ, số, gạch ngang/dưới';

    const value = Number(form.value);
    if (!form.value || Number.isNaN(value) || value <= 0)
      next.value = 'Giá trị phải lớn hơn 0';
    else if (isPercent && value > 100)
      next.value = 'Giá trị phần trăm không được vượt quá 100';

    if (!form.startAt) next.startAt = 'Chọn ngày bắt đầu';
    if (!form.endAt) next.endAt = 'Chọn ngày kết thúc';
    if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt))
      next.endAt = 'Ngày kết thúc phải sau ngày bắt đầu';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      appliesTo: form.appliesTo,
      isActive: form.isActive,
    };
    if (form.minOrder !== '') payload.minOrder = Number(form.minOrder);
    if (form.maxUse !== '') payload.maxUse = Number(form.maxUse);
    if (form.maxUsePerUser !== '') payload.maxUsePerUser = Number(form.maxUsePerUser);
    // maxDiscount only meaningful for PERCENT; send null to clear otherwise.
    if (isPercent && form.maxDiscount !== '') payload.maxDiscount = Number(form.maxDiscount);
    else payload.maxDiscount = null;
    return payload;
  };

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? adminCouponService.update(id, payload) : adminCouponService.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá');
      queryClient.invalidateQueries({ queryKey: ['adminCoupons'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['adminCoupon', id] });
      navigate('/admin/coupons');
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
      toast.error(err?.message || 'Không thể lưu mã giảm giá');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(buildPayload());
  };

  if (isEdit && loadingCoupon) {
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
            onClick={() => navigate('/admin/coupons')}
            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-ink-700">
            {isEdit ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/coupons')}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" loading={saveMutation.isPending}>
            {isEdit ? 'Lưu thay đổi' : 'Tạo mã'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Thông tin cơ bản</h2>
            <Input
              label="Mã giảm giá"
              value={form.code}
              onChange={setField('code')}
              placeholder="VD: SUMMER2026"
              error={errors.code}
              helperText="Tự động viết hoa khi lưu."
              className="font-mono uppercase"
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label="Loại giảm giá"
                value={form.type}
                onChange={setField('type')}
                options={TYPE_OPTIONS}
              />
              <Input
                label={isPercent ? 'Giá trị (%)' : 'Giá trị (VND)'}
                type="number"
                min="0"
                value={form.value}
                onChange={setField('value')}
                placeholder={isPercent ? 'VD: 10' : 'VD: 100000'}
                error={errors.value}
                disabled={isFreeDriver}
                helperText={isFreeDriver ? 'Loại này bỏ qua giá trị.' : undefined}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Đơn tối thiểu (VND)"
                type="number"
                min="0"
                value={form.minOrder}
                onChange={setField('minOrder')}
                placeholder="0 = không yêu cầu"
              />
              <Input
                label="Giảm tối đa (VND)"
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={setField('maxDiscount')}
                placeholder="Chỉ áp dụng cho loại %"
                disabled={!isPercent}
                helperText={!isPercent ? 'Chỉ dùng cho loại phần trăm.' : undefined}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Giới hạn sử dụng</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Tổng lượt dùng"
                type="number"
                min="0"
                value={form.maxUse}
                onChange={setField('maxUse')}
                placeholder="0 = không giới hạn"
              />
              <Input
                label="Lượt dùng / người"
                type="number"
                min="1"
                value={form.maxUsePerUser}
                onChange={setField('maxUsePerUser')}
                placeholder="Mặc định 1"
              />
            </div>
          </div>
        </div>

        {/* Sidebar column */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Hiệu lực</h2>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                Bắt đầu
              </label>
              <input
                type="datetime-local"
                value={form.startAt}
                onChange={setField('startAt')}
                className="input"
              />
              {errors.startAt && (
                <p className="mt-1 text-xs text-danger">{errors.startAt}</p>
              )}
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-ink-700">
                Kết thúc
              </label>
              <input
                type="datetime-local"
                value={form.endAt}
                onChange={setField('endAt')}
                className="input"
              />
              {errors.endAt && <p className="mt-1 text-xs text-danger">{errors.endAt}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-4 text-sm font-semibold text-ink-700">Phạm vi & trạng thái</h2>
            <Select
              label="Áp dụng cho"
              value={form.appliesTo}
              onChange={setField('appliesTo')}
              options={APPLIES_OPTIONS}
            />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-700">Kích hoạt</span>
              <Switch
                enabled={form.isActive}
                onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
