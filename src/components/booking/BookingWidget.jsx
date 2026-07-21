// src/components/booking/BookingWidget.jsx — Sticky booking sidebar (left) on PDP
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, ChevronDown, Truck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import RentalTypeTabs from './RentalTypeTabs.jsx';
import DateRangePicker from './DateRangePicker.jsx';
import PriceBreakdown from './PriceBreakdown.jsx';
import { validateBookingDates } from '../../utils/booking.js';
import { carService } from '../../services/carService.js';
import { stationService } from '../../services/stationService.js';
import { formatCurrency } from '../../utils/format.js';

export default function BookingWidget({ car }) {
  const navigate = useNavigate();
  const [rentalType, setRentalType] = useState('SELF_DRIVE');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('07:00');
  const [returnTime, setReturnTime] = useState('19:00');
  const [insurance, setInsurance] = useState('basic');
  const [pickupStation, setPickupStation] = useState(car?.station?.id || '');
  const [dropoffStation, setDropoffStation] = useState('');
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Fetch availability (booked dates)
  const { data: availData } = useQuery({
    queryKey: ['car-availability', car?.id],
    queryFn: () => carService.availability(car.id),
    enabled: !!car?.id,
    staleTime: 60_000,
  });
  const bookedRanges = availData?.data?.bookedRanges ?? [];

  // Fetch stations for dropdowns
  const { data: stationsData } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationService.list({ limit: 50 }),
    staleTime: 5 * 60_000,
  });
  const stations = stationsData?.data ?? [];

  const handleBook = () => {
    if (!pickupDate || !returnDate) {
      toast.error('Vui lòng chọn ngày nhận và trả xe.');
      return;
    }

    const pickupAt = `${pickupDate}T${pickupTime}:00`;
    const returnAt = `${returnDate}T${returnTime}:00`;
    const { valid, errors } = validateBookingDates(pickupAt, returnAt);

    if (!valid) {
      setValidationErrors(errors);
      errors.forEach((e) => toast.error(e));
      return;
    }

    setValidationErrors([]);
    const params = new URLSearchParams({
      vehicleId: car.id,
      pickup: pickupAt,
      return: returnAt,
      rentalType,
      insurance,
    });
    if (pickupStation) params.set('pickupStation', pickupStation);
    if (dropoffStation) params.set('dropoffStation', dropoffStation);

    navigate(`/checkout/${car.id}?${params.toString()}`);
  };

  return (
    <div className="card sticky top-20 p-5">
      {/* Price header */}
      <div className="mb-4 pb-4 border-b border-ink-100">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-brand-primary">
            {formatCurrency(car.pricePerDay)}
          </span>
          <span className="text-sm text-ink-400">/ngày</span>
        </div>
        {car.pricePerMonth > 0 && (
          <p className="text-xs text-ink-400 mt-0.5">
            Thuê tháng: {formatCurrency(car.pricePerMonth)}/tháng
          </p>
        )}
      </div>

      {/* Rental type tabs */}
      <RentalTypeTabs value={rentalType} onChange={setRentalType} />

      {/* Pickup / Dropoff location */}
      <div className="mt-4 space-y-2">
        <div>
          <label className="text-[11px] font-medium text-ink-500 mb-1 block">Điểm nhận xe</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <select
              value={pickupStation}
              onChange={(e) => setPickupStation(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-ink-100 text-sm text-ink-900 appearance-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
            >
              <option value="">Chọn điểm nhận</option>
              {stations.length > 0
                ? stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.city}
                    </option>
                  ))
                : car?.station && (
                    <option value={car.station.id}>
                      {car.station.name} — {car.station.city}
                    </option>
                  )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-ink-500 mb-1 block">Điểm trả xe</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <select
              value={dropoffStation}
              onChange={(e) => setDropoffStation(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-ink-100 text-sm text-ink-900 appearance-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none"
            >
              <option value="">Cùng điểm nhận</option>
              {stations.length > 0
                ? stations.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.city}
                    </option>
                  ))
                : car?.station && (
                    <option value={car.station.id}>
                      {car.station.name} — {car.station.city}
                    </option>
                  )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-400 pointer-events-none" />
          </div>
        </div>

        {/* Delivery option */}
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input
            type="checkbox"
            checked={deliveryEnabled}
            onChange={(e) => setDeliveryEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-ink-300 text-brand-primary focus:ring-brand-primary/20"
          />
          <Truck className="w-4 h-4 text-ink-400" />
          <span className="text-xs text-ink-600">
            Giao xe tận nơi <span className="text-ink-400">(phụ phí)</span>
          </span>
        </label>
      </div>

      {/* Date picker */}
      <div className="mt-4">
        <DateRangePicker
          pickupDate={pickupDate}
          returnDate={returnDate}
          onPickupChange={setPickupDate}
          onReturnChange={setReturnDate}
          pickupTime={pickupTime}
          returnTime={returnTime}
          onPickupTimeChange={setPickupTime}
          onReturnTimeChange={setReturnTime}
          bookedRanges={bookedRanges}
        />
      </div>

      {/* Insurance selection */}
      <div className="mt-4">
        <label className="text-[11px] font-medium text-ink-500 mb-2 block">Bảo hiểm</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setInsurance('basic')}
            className={`p-3 rounded-lg border text-center transition-all ${
              insurance === 'basic'
                ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20'
                : 'border-ink-100 hover:border-ink-300'
            }`}
          >
            <div className="text-xs font-semibold text-ink-900">Cơ bản</div>
            <div className="text-[10px] text-ink-400 mt-0.5">Miễn phí</div>
          </button>
          <button
            type="button"
            onClick={() => setInsurance('premium')}
            className={`p-3 rounded-lg border text-center transition-all ${
              insurance === 'premium'
                ? 'border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20'
                : 'border-ink-100 hover:border-ink-300'
            }`}
          >
            <div className="text-xs font-semibold text-ink-900">Premium</div>
            <div className="text-[10px] text-brand-primary mt-0.5">200.000₫/ngày</div>
          </button>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="mt-4 pt-4 border-t border-ink-100">
        <PriceBreakdown
          pricePerDay={car.pricePerDay}
          pickupDate={pickupDate}
          returnDate={returnDate}
          insuranceType={insurance}
          deliveryFee={150000}
          showDelivery={deliveryEnabled}
        />
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-100">
          {validationErrors.map((e, i) => (
            <p key={i} className="text-xs text-red-600 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {e}
            </p>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handleBook}
        disabled={car.status !== 'AVAILABLE'}
        className="mt-4 w-full btn btn-primary btn-lg"
      >
        {car.status === 'AVAILABLE' ? 'Đặt ngay' : 'Xe đang không sẵn sàng'}
      </button>

      <p className="text-center text-[10px] text-ink-400 mt-2">Bạn chưa bị tính phí ở bước này</p>
    </div>
  );
}
