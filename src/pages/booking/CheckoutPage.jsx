import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { carService } from '../../services/carService.js';
import { bookingService } from '../../services/bookingService.js';
import { formatCurrency, diffDays } from '../../utils/format.js';
import Loading from '../../components/common/Loading.jsx';

export default function CheckoutPage() {
  const { carId } = useParams();
  const navigate = useNavigate();

  const { data: carData, isLoading } = useQuery({
    queryKey: ['car', carId],
    queryFn: () => carService.detail(carId),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rentalType: 'SELF_DRIVE',
      pickupAt: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
      returnAt: dayjs().add(3, 'day').format('YYYY-MM-DDTHH:mm'),
      note: '',
    },
  });

  const pickupAt = watch('pickupAt');
  const returnAt = watch('returnAt');

  const createMutation = useMutation({
    mutationFn: (payload) => bookingService.create(payload),
    onSuccess: (res) => {
      toast.success('Tạo đơn thành công!');
      const booking = res.data.booking;
      navigate(`/booking-success/${booking.id}`);
    },
    onError: (e) => toast.error(e?.message || 'Tạo đơn thất bại'),
  });

  // Reserve the page's typical height while loading so the footer doesn't jump
  // once the car data resolves (kills the large CLS the checkout route showed).
  if (isLoading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  const car = carData?.data?.car;
  if (!car)
    return <div className="flex min-h-[70vh] items-center justify-center p-8 text-center">Không tìm thấy xe.</div>;

  const days = pickupAt && returnAt ? diffDays(pickupAt, returnAt) : 1;
  const subtotal = Number(car.pricePerDay) * days;

  const onSubmit = (values) => {
    createMutation.mutate({
      carId: car.id,
      rentalType: values.rentalType,
      pickupAt: new Date(values.pickupAt).toISOString(),
      returnAt: new Date(values.returnAt).toISOString(),
      note: values.note,
    });
  };

  return (
    <div className="mx-auto min-h-[70vh] max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Xác nhận đặt xe</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6 lg:col-span-2">
          <div>
            <label className="label">Hình thức thuê</label>
            <select className="input" {...register('rentalType')}>
              <option value="SELF_DRIVE">Tự lái</option>
              <option value="WITH_DRIVER">Có tài xế</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label">Ngày nhận xe</label>
              <input
                type="datetime-local"
                className="input"
                {...register('pickupAt', { required: 'Bắt buộc' })}
              />
              {errors.pickupAt && (
                <p className="mt-1 text-xs text-red-500">{errors.pickupAt.message}</p>
              )}
            </div>
            <div>
              <label className="label">Ngày trả xe</label>
              <input
                type="datetime-local"
                className="input"
                {...register('returnAt', { required: 'Bắt buộc' })}
              />
              {errors.returnAt && (
                <p className="mt-1 text-xs text-red-500">{errors.returnAt.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Ghi chú</label>
            <textarea rows={3} className="input" {...register('note')} />
          </div>

          <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
            {createMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt xe'}
          </button>
        </form>

        {/* Summary */}
        <aside className="card h-fit p-6">
          <h3 className="text-base font-semibold text-gray-900">Tóm tắt</h3>
          <div className="mt-4 flex gap-3">
            <img
              src={car.thumbnailUrl || 'https://placehold.co/120x80?text=Car'}
              alt={car.name}
              className="h-16 w-20 rounded-md object-cover"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{car.name}</p>
              <p className="text-xs text-gray-500">
                {car.brand?.name} • {car.category?.name}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <Row label="Đơn giá / ngày" value={formatCurrency(car.pricePerDay)} />
            <Row label="Số ngày thuê" value={`${days} ngày`} />
            <Row label="Tạm tính" value={formatCurrency(subtotal)} />
            <div className="my-2 border-t border-gray-100"></div>
            <Row
              label={<span className="font-semibold">Tổng cộng</span>}
              value={
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(subtotal)}
                </span>
              }
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-gray-700">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
