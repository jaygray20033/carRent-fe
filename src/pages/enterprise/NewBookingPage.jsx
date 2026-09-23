// src/pages/enterprise/NewBookingPage.jsx
// ENT-Day 4 — 3-step booking: trip info → VAS → review & submit
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { enterpriseService } from '../../services/enterpriseService.js';
import VASSelector from '../../components/enterprise/VASSelector.jsx';
import Loading from '../../components/common/Loading.jsx';

const VEHICLE_TYPES = [
  { value: '4_5_seat', label: 'Xe 4-5 chỗ' },
  { value: '7_seat', label: 'Xe 7 chỗ' },
  { value: '16_seat', label: 'Xe 16 chỗ' },
  { value: '29_seat', label: 'Xe 29 chỗ' },
];

export default function EnterpriseNewBookingPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    vehicleType: '7_seat',
    rentalType: 'full_day',
    estimatedKm: 180,
    pickupAt: dayjs().add(1, 'day').hour(8).minute(0).second(0).format('YYYY-MM-DDTHH:mm'),
    returnAt: dayjs().add(1, 'day').hour(18).minute(0).second(0).format('YYYY-MM-DDTHH:mm'),
    pickupAddress: '',
    dropoffAddress: '',
    purpose: '',
  });
  const [vasValue, setVasValue] = useState({});

  const { data: priceRes, isLoading: loadingPrice } = useQuery({
    queryKey: ['enterprise', 'priceConfig'],
    queryFn: () => enterpriseService.myPriceConfig(),
  });
  const { data: vasRes, isLoading: loadingVas } = useQuery({
    queryKey: ['enterprise', 'vasPricing'],
    queryFn: () => enterpriseService.myVasPricing(),
  });

  const priceConfig = useMemo(
    () => (priceRes?.data ?? priceRes)?.priceConfig || {},
    [priceRes]
  );
  const vasItems = useMemo(() => (vasRes?.data ?? vasRes)?.items || [], [vasRes]);

  const createMut = useMutation({
    mutationFn: async () => {
      const bookingRes = await enterpriseService.createBooking({
        vehicleType: form.vehicleType,
        rentalType: form.rentalType,
        estimatedKm: Number(form.estimatedKm),
        pickupAt: new Date(form.pickupAt).toISOString(),
        returnAt: new Date(form.returnAt).toISOString(),
        pickupAddress: form.pickupAddress.trim(),
        dropoffAddress: form.dropoffAddress.trim(),
        purpose: form.purpose?.trim() || null,
      });
      const booking = (bookingRes?.data ?? bookingRes)?.booking || bookingRes?.data?.booking;
      const bookingId = booking?.id;
      if (!bookingId) throw new Error('Không tạo được booking');

      for (const item of vasItems) {
        const id = item.vasId ?? item.id;
        const row = vasValue[id];
        if (!row?.enabled) continue;
        await enterpriseService.addBookingVas(bookingId, {
          vasId: id,
          headcount: Math.max(1, Number(row.headcount) || 1),
          note: row.note || null,
        });
      }
      return booking;
    },
    onSuccess: () => {
      toast.success('Đã gửi yêu cầu, chờ duyệt');
      qc.invalidateQueries({ queryKey: ['enterprise', 'bookings'] });
      navigate('/enterprise/schedule');
    },
    onError: (err) => {
      const fieldMsg = Array.isArray(err?.errors)
        ? err.errors.map((e) => e.message).filter(Boolean).join('; ')
        : '';
      toast.error(fieldMsg || err?.message || 'Không tạo được chuyến');
    },
  });

  function validateStep1() {
    const pickup = form.pickupAddress.trim();
    const dropoff = form.dropoffAddress.trim();
    if (pickup.length < 3 || dropoff.length < 3) {
      toast.error('Điểm đón/trả cần ít nhất 3 ký tự');
      return false;
    }
    const km = Number(form.estimatedKm);
    if (!Number.isFinite(km) || km <= 0) {
      toast.error('Km ước tính phải lớn hơn 0');
      return false;
    }
    const pickupAt = new Date(form.pickupAt);
    const returnAt = new Date(form.returnAt);
    if (Number.isNaN(pickupAt.getTime()) || Number.isNaN(returnAt.getTime())) {
      toast.error('Thời gian đón/trả không hợp lệ');
      return false;
    }
    if (pickupAt.getTime() < Date.now() + 2 * 60 * 60 * 1000) {
      toast.error('Cần đặt trước ít nhất 2 tiếng');
      return false;
    }
    if (returnAt.getTime() <= pickupAt.getTime()) {
      toast.error('Giờ trả phải sau giờ đón');
      return false;
    }
    return true;
  }

  if (loadingPrice || loadingVas) return <Loading />;

  const availableVehicles = VEHICLE_TYPES.filter(
    (v) => priceConfig[v.value] || v.value !== '29_seat'
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink-700">Đặt chuyến mới</h1>

      <div className="flex gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`rounded-full px-3 py-1 font-semibold ${
              step === s
                ? 'bg-brand-primary text-white'
                : step > s
                  ? 'bg-brand-primary/15 text-brand-primary'
                  : 'bg-ink-100 text-ink-500'
            }`}
          >
            Bước {s}
          </div>
        ))}
      </div>

      <div className="max-w-2xl">
        <div className="space-y-4">
          {step === 1 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 space-y-3">
              <h2 className="font-semibold text-ink-700">Thông tin chuyến</h2>
              <label className="block text-sm">
                Loại xe
                <select
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                  value={form.vehicleType}
                  onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                >
                  {availableVehicles.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                Hình thức
                <select
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                  value={form.rentalType}
                  onChange={(e) => setForm({ ...form, rentalType: e.target.value })}
                >
                  <option value="half_day">Nửa ngày</option>
                  <option value="full_day">Cả ngày</option>
                </select>
              </label>
              <label className="block text-sm">
                Km ước tính
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                  value={form.estimatedKm}
                  onChange={(e) => setForm({ ...form, estimatedKm: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  Đón
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                    value={form.pickupAt}
                    onChange={(e) => setForm({ ...form, pickupAt: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  Trả
                  <input
                    type="datetime-local"
                    className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                    value={form.returnAt}
                    onChange={(e) => setForm({ ...form, returnAt: e.target.value })}
                  />
                </label>
              </div>
              <label className="block text-sm">
                Điểm đón
                <input
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                  value={form.pickupAddress}
                  onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                Điểm trả
                <input
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                  value={form.dropoffAddress}
                  onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                Mục đích
                <input
                  className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                />
              </label>
              <button
                type="button"
                className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  if (!validateStep1()) return;
                  setStep(2);
                }}
              >
                Tiếp: Dịch vụ gia tăng
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 space-y-3">
              <h2 className="font-semibold text-ink-700">Dịch vụ gia tăng (VAS)</h2>
              <VASSelector items={vasItems} value={vasValue} onChange={setVasValue} />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-ink-100 px-4 py-2 text-sm font-semibold"
                  onClick={() => setStep(1)}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setStep(3)}
                >
                  Tiếp: Xem lại
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100 space-y-3">
              <h2 className="font-semibold text-ink-700">Xem lại & Gửi</h2>
              <ul className="text-sm text-ink-600 space-y-1">
                <li>
                  Xe: {form.vehicleType} · {form.rentalType} · {form.estimatedKm} km
                </li>
                <li>
                  {form.pickupAddress} → {form.dropoffAddress}
                </li>
                <li>
                  {form.pickupAt} → {form.returnAt}
                </li>
                {form.purpose && <li>Mục đích: {form.purpose}</li>}
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-ink-100 px-4 py-2 text-sm font-semibold"
                  onClick={() => setStep(2)}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  data-testid="submit-booking"
                  disabled={createMut.isPending}
                  className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  onClick={() => createMut.mutate()}
                >
                  {createMut.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
