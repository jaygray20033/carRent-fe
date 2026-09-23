// src/pages/booking/CheckoutPage.jsx
// UC-14..17 (Day 12–13) — 4-step checkout over the real DRAFT → confirm flow:
//   1. Tóm tắt (create DRAFT + 15-min hold)
//   2. Bảo hiểm (updateDraft insurancePlanId → recompute)
//   3. Mã giảm giá (validate coupon against the draft)
//   4. Xác nhận (confirm DRAFT → PENDING_PAYMENT → /payment/:id)
//
// The price sidebar is server-driven: it renders the exact breakdown the API
// returned on the draft/update, so the shown total never drifts from what the
// backend will charge (D11 formula: base + driver + insurance + dropoff + tax
// − discount + deposit).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  Check,
  ChevronLeft,
  ClipboardList,
  ShieldCheck,
  Ticket,
  CircleCheck,
  Clock,
} from 'lucide-react';
import { carService } from '../../services/carService.js';
import { bookingService } from '../../services/bookingService.js';
import { insuranceService } from '../../services/insuranceService.js';
import { couponService } from '../../services/couponService.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import PriceBreakdown from '../../components/booking/PriceBreakdown.jsx';
import Loading from '../../components/common/Loading.jsx';

const STEPS = [
  { id: 1, label: 'Tóm tắt', icon: ClipboardList },
  { id: 2, label: 'Bảo hiểm', icon: ShieldCheck },
  { id: 3, label: 'Mã giảm giá', icon: Ticket },
  { id: 4, label: 'Xác nhận', icon: CircleCheck },
];

const unwrap = (res) => res?.data ?? res ?? {};

export default function CheckoutPage() {
  const { carId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [booking, setBooking] = useState(null); // the server DRAFT (source of truth)
  const [insurancePlanId, setInsurancePlanId] = useState(null); // null = basic (none)
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const draftStarted = useRef(false);

  // Query params handed off by the PDP BookingWidget.
  const pickupAt = params.get('pickup');
  const returnAt = params.get('return');
  const rentalType = params.get('rentalType') || 'SELF_DRIVE';
  const wantPremium = params.get('insurance') === 'premium';

  const { data: carData, isLoading: carLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => carService.detail(carId),
  });
  const car = unwrap(carData)?.car;

  const { data: planData } = useQuery({
    queryKey: ['insurance-plans'],
    queryFn: () => insuranceService.list(),
    staleTime: 5 * 60_000,
  });
  const premiumPlan = useMemo(() => {
    const plans = unwrap(planData) || [];
    return Array.isArray(plans) ? plans.find((p) => p.code === 'PREMIUM') : null;
  }, [planData]);

  const pickupPoint = car?.station?.name || 'Điểm nhận mặc định';

  // ── DRAFT lifecycle ─────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (payload) => bookingService.createDraft(payload),
    onSuccess: (res) => {
      const b = unwrap(res);
      setBooking(b);
      setInsurancePlanId(b.insurancePlanId ?? null);
    },
    onError: (e) => toast.error(e?.message || 'Không tạo được đơn nháp'),
  });

  const updateMut = useMutation({
    mutationFn: (payload) => bookingService.updateDraft(booking.id, payload),
    onSuccess: (res) => setBooking(unwrap(res)),
    onError: (e) => toast.error(e?.message || 'Cập nhật thất bại'),
  });

  const confirmMut = useMutation({
    mutationFn: (payload) => bookingService.confirm(booking.id, payload),
    onSuccess: (res) => {
      const b = unwrap(res);
      toast.success('Đã xác nhận đơn, chuyển sang thanh toán');
      navigate(`/payment/${b.id}`);
    },
    onError: (e) => toast.error(e?.message || 'Xác nhận thất bại'),
  });

  // Create the DRAFT once, as soon as we have a car + dates.
  useEffect(() => {
    if (draftStarted.current || !car || !pickupAt || !returnAt) return;
    draftStarted.current = true;
    createMut.mutate({
      vehicleId: car.id,
      pickup_at: dayjs(pickupAt).toISOString(),
      return_at: dayjs(returnAt).toISOString(),
      pickup_point: pickupPoint,
      dropoff_point: pickupPoint,
      rental_type: rentalType,
      premium_insurance: wantPremium,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car, pickupAt, returnAt]);

  if (carLoading || createMut.isPending)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );

  if (!car)
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-8 text-center text-ink-500">
        Không tìm thấy xe.
      </div>
    );

  if (!pickupAt || !returnAt)
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ink-500">
          Thiếu thông tin ngày thuê. Vui lòng chọn lại xe và ngày nhận/trả.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/cars/${car.slug || car.id}`)}
          className="btn-primary mt-4"
        >
          Quay lại trang xe
        </button>
      </div>
    );

  // Toggle premium insurance → updateDraft with the PREMIUM plan id (or null = basic).
  const chooseInsurance = (planId) => {
    setInsurancePlanId(planId);
    if (booking) updateMut.mutate({ insurancePlanId: planId });
  };

  const applyCoupon = () => {
    const code = couponCode.trim();
    if (!code || !booking) return;
    couponService
      .validate(code, booking.id)
      .then((res) => {
        const r = unwrap(res);
        setCouponResult(r);
        if (r?.valid) toast.success(r.message || 'Áp dụng mã thành công');
        else toast.error(r?.message || 'Mã không hợp lệ');
      })
      .catch((e) => {
        setCouponResult({ valid: false, message: e?.message });
        toast.error(e?.message || 'Mã không hợp lệ');
      });
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponResult(null);
  };

  const confirmBooking = () => {
    const payload = {};
    if (couponResult?.valid && couponCode.trim()) payload.coupon_code = couponCode.trim();
    confirmMut.mutate(payload);
  };

  const goNext = () => {
    setStep((s) => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink-900">Xác nhận đặt xe</h1>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-1 ${
                  active
                    ? 'bg-brand-primary text-white ring-brand-primary'
                    : done
                      ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                      : 'bg-white text-ink-400 ring-ink-100'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={`hidden text-sm sm:block ${
                  active ? 'font-semibold text-ink-900' : 'text-ink-400'
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-px flex-1 ${done ? 'bg-emerald-300' : 'bg-ink-100'}`} />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {step === 1 && (
            <StepSummary
              car={car}
              pickupAt={pickupAt}
              returnAt={returnAt}
              rentalType={rentalType}
              pickupPoint={pickupPoint}
              booking={booking}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <StepInsurance
              premiumPlan={premiumPlan}
              insurancePlanId={insurancePlanId}
              onChoose={chooseInsurance}
              saving={updateMut.isPending}
              onBack={goBack}
              onNext={goNext}
            />
          )}
          {step === 3 && (
            <StepCoupon
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponResult={couponResult}
              onApply={applyCoupon}
              onRemove={removeCoupon}
              onBack={goBack}
              onNext={goNext}
            />
          )}
          {step === 4 && (
            <StepConfirm
              car={car}
              booking={booking}
              pickupAt={pickupAt}
              returnAt={returnAt}
              couponResult={couponResult}
              couponCode={couponCode}
              confirming={confirmMut.isPending}
              onBack={goBack}
              onConfirm={confirmBooking}
            />
          )}
        </div>

        {/* Sticky server-driven price summary */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <div className="card p-5">
            <h3 className="mb-3 text-base font-semibold text-ink-900">Chi tiết giá</h3>
            {booking ? (
              <PriceBreakdown breakdown={booking} />
            ) : (
              <div className="py-6 text-center text-sm text-ink-400">Đang tính giá…</div>
            )}
            {booking?.holdTtl > 0 && (
              <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-ink-400">
                <Clock className="h-3 w-3" /> Giữ chỗ trong {Math.round(booking.holdTtl / 60)} phút
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepSummary({ car, pickupAt, returnAt, rentalType, pickupPoint, booking, onNext }) {
  return (
    <div className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-ink-900">Tóm tắt đơn</h2>
      <div className="flex gap-4">
        <img
          src={car.thumbnailUrl || car.images?.[0]?.url || 'https://placehold.co/160x110?text=Car'}
          alt={car.name}
          className="h-24 w-32 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="font-semibold text-ink-900">{car.name}</p>
          <p className="text-sm text-ink-400">
            {car.brand?.name} • {car.category?.name}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {rentalType === 'WITH_DRIVER' ? 'Thuê có tài xế' : 'Tự lái'}
          </p>
        </div>
      </div>
      <dl className="grid gap-3 border-t border-ink-100 pt-4 text-sm sm:grid-cols-2">
        <Field label="Nhận xe" value={formatDateTime(pickupAt)} />
        <Field label="Trả xe" value={formatDateTime(returnAt)} />
        <Field label="Điểm nhận" value={pickupPoint} />
        <Field label="Số ngày" value={booking ? `${booking.totalDays} ngày` : '—'} />
      </dl>
      <div className="flex justify-end pt-2">
        <button type="button" className="btn-primary" disabled={!booking} onClick={onNext}>
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

function StepInsurance({ premiumPlan, insurancePlanId, onChoose, saving, onBack, onNext }) {
  const premiumId = premiumPlan?.id ?? null;
  const options = [
    {
      id: null,
      name: 'Bảo hiểm cơ bản',
      desc: 'Đã bao gồm — trách nhiệm dân sự bắt buộc.',
      badge: 'Miễn phí',
    },
    {
      id: premiumId,
      name: premiumPlan?.name || 'Bảo hiểm Premium',
      desc: premiumPlan?.description || 'Bảo hiểm vật chất mở rộng, giảm mức tự chịu.',
      badge: premiumPlan ? `${premiumPlan.ratePercent}% giá thuê` : '—',
      disabled: !premiumPlan,
    },
  ];
  return (
    <div className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-ink-900">Chọn gói bảo hiểm</h2>
      <div className="space-y-3">
        {options.map((opt) => {
          const selected = insurancePlanId === opt.id;
          return (
            <button
              key={String(opt.id)}
              type="button"
              disabled={opt.disabled || saving}
              onClick={() => onChoose(opt.id)}
              className={`flex w-full items-start justify-between gap-3 rounded-xl border p-4 text-left transition-all ${
                selected
                  ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20'
                  : 'border-ink-100 hover:border-ink-300'
              } ${opt.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <div>
                <div className="font-semibold text-ink-900">{opt.name}</div>
                <div className="mt-0.5 text-sm text-ink-400">{opt.desc}</div>
              </div>
              <span className="shrink-0 rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-600">
                {opt.badge}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between pt-2">
        <button type="button" className="btn-outline inline-flex items-center gap-1" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Quay lại
        </button>
        <button type="button" className="btn-primary" disabled={saving} onClick={onNext}>
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

function StepCoupon({ couponCode, setCouponCode, couponResult, onApply, onRemove, onBack, onNext }) {
  const applied = couponResult?.valid === true;
  return (
    <div className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-ink-900">Mã giảm giá</h2>
      <p className="text-sm text-ink-400">
        Nhập mã khuyến mãi (nếu có). Có thể bỏ qua bước này.
      </p>
      <div className="flex gap-2">
        <input
          className="input flex-1 uppercase"
          placeholder="VD: WELCOME10"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={applied}
        />
        {applied ? (
          <button type="button" className="btn-outline" onClick={onRemove}>
            Bỏ mã
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={!couponCode.trim()}
            onClick={onApply}
          >
            Áp dụng
          </button>
        )}
      </div>
      {couponResult && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            applied ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {couponResult.message ||
            (applied ? 'Áp dụng mã thành công' : 'Mã không hợp lệ')}
        </div>
      )}
      <div className="flex justify-between pt-2">
        <button type="button" className="btn-outline inline-flex items-center gap-1" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Quay lại
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

function StepConfirm({
  car,
  booking,
  pickupAt,
  returnAt,
  couponResult,
  couponCode,
  confirming,
  onBack,
  onConfirm,
}) {
  return (
    <div className="card space-y-4 p-6">
      <h2 className="text-lg font-semibold text-ink-900">Xác nhận & thanh toán</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Field label="Xe" value={car.name} />
        <Field label="Số ngày" value={booking ? `${booking.totalDays} ngày` : '—'} />
        <Field label="Nhận xe" value={formatDateTime(pickupAt)} />
        <Field label="Trả xe" value={formatDateTime(returnAt)} />
        {couponResult?.valid && (
          <Field label="Mã giảm giá" value={couponCode.trim().toUpperCase()} />
        )}
      </dl>
      <div className="rounded-xl bg-ink-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink-900">Tổng thanh toán</span>
          <span className="text-xl font-bold text-brand-primary">
            {formatCurrency(booking?.totalAmount)}
          </span>
        </div>
      </div>
      <p className="text-xs text-ink-400">
        Nhấn “Xác nhận đặt xe” để giữ chỗ và chuyển sang bước thanh toán. Đơn sẽ tự huỷ nếu
        không thanh toán trong thời gian giữ chỗ.
      </p>
      <div className="flex justify-between pt-2">
        <button type="button" className="btn-outline inline-flex items-center gap-1" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Quay lại
        </button>
        <button type="button" className="btn-primary" disabled={!booking || confirming} onClick={onConfirm}>
          {confirming ? 'Đang xử lý…' : 'Xác nhận đặt xe'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-ink-400">{label}</dt>
      <dd className="font-medium text-ink-800">{value}</dd>
    </div>
  );
}
