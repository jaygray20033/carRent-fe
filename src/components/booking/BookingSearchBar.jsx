import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, ChevronDown, Search, X, AlertCircle } from 'lucide-react';
import { stationService } from '../../services/stationService.js';

export default function BookingSearchBar({ variant = 'hero' }) {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationOpen, setStationOpen] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [rentalType, setRentalType] = useState('SELF_DRIVE');
  const [errors, setErrors] = useState({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    stationService
      .list()
      .then((res) => {
        setStations(res.data?.items || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validate = () => {
    const errs = {};
    const now = new Date();
    const minPickup = new Date(now.getTime() + 60 * 60 * 1000);

    if (!selectedStation) errs.station = 'Vui lòng chọn địa điểm nhận xe';
    if (!pickupDate) {
      errs.pickup = 'Vui lòng chọn ngày nhận xe';
    } else if (new Date(pickupDate) < minPickup) {
      errs.pickup = 'Ngày nhận xe phải sau ít nhất 1 giờ';
    }
    if (!returnDate) {
      errs.return = 'Vui lòng chọn ngày trả xe';
    } else if (pickupDate) {
      const pickMs = new Date(pickupDate).getTime();
      const retMs = new Date(returnDate).getTime();
      if (retMs <= pickMs + 4 * 60 * 60 * 1000) {
        errs.return = 'Ngày trả xe phải sau ngày nhận ít nhất 4 giờ';
      }
      if (retMs > pickMs + 90 * 24 * 60 * 60 * 1000) {
        errs.return = 'Thời gian thuê tối đa 90 ngày';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const params = new URLSearchParams({
      station: selectedStation.id,
      from: pickupDate,
      to: returnDate,
      type: rentalType,
    });
    navigate(`/cars?${params.toString()}`);
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`${
        isHero ? 'bg-white rounded-2xl shadow-xl p-4 md:p-5' : 'bg-white rounded-xl shadow-card p-4'
      }`}
    >
      <div className={`grid gap-3 ${isHero ? 'md:grid-cols-12' : 'md:grid-cols-4'} items-end`}>
        {/* Station Select */}
        <div className={isHero ? 'md:col-span-3' : ''} ref={dropdownRef}>
          <label className="block text-xs font-medium text-ink-500 mb-1.5">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />
            Địa điểm nhận xe
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setStationOpen(!stationOpen)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition ${
                errors.station ? 'border-danger' : 'border-ink-100 hover:border-ink-300'
              } flex items-center justify-between bg-white`}
            >
              <span className={selectedStation ? 'text-ink-900' : 'text-ink-300'}>
                {selectedStation?.name || 'Chọn địa điểm'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-ink-400 transition-transform ${stationOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {stationOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-ink-100 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto">
                {stations.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStation(s);
                      setStationOpen(false);
                      setErrors((prev) => ({ ...prev, station: undefined }));
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-ink-50 transition flex items-center gap-2 ${
                      selectedStation?.id === s.id
                        ? 'bg-blue-50 text-brand-primary font-medium'
                        : 'text-ink-700'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-ink-400" />
                    <div>
                      <div>{s.name}</div>
                      <div className="text-xs text-ink-400">{s.city}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.station && (
            <p className="text-xs text-danger mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.station}
            </p>
          )}
        </div>

        {/* Pickup Date */}
        <div className={isHero ? 'md:col-span-2' : ''}>
          <label className="block text-xs font-medium text-ink-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            Ngày nhận xe
          </label>
          <input
            type="datetime-local"
            value={pickupDate}
            onChange={(e) => {
              setPickupDate(e.target.value);
              setErrors((prev) => ({ ...prev, pickup: undefined }));
            }}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
              errors.pickup ? 'border-danger' : 'border-ink-100'
            } focus:outline-none focus:border-brand-primary`}
          />
          {errors.pickup && (
            <p className="text-xs text-danger mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.pickup}
            </p>
          )}
        </div>

        {/* Return Date */}
        <div className={isHero ? 'md:col-span-2' : ''}>
          <label className="block text-xs font-medium text-ink-500 mb-1.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            Ngày trả xe
          </label>
          <input
            type="datetime-local"
            value={returnDate}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setErrors((prev) => ({ ...prev, return: undefined }));
            }}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm ${
              errors.return ? 'border-danger' : 'border-ink-100'
            } focus:outline-none focus:border-brand-primary`}
          />
          {errors.return && (
            <p className="text-xs text-danger mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.return}
            </p>
          )}
        </div>

        {/* Rental Type Toggle */}
        <div className={isHero ? 'md:col-span-3' : ''}>
          <label className="block text-xs font-medium text-ink-500 mb-1.5">Loại dịch vụ</label>
          <div className="flex rounded-lg overflow-hidden border border-ink-100">
            <button
              type="button"
              onClick={() => setRentalType('SELF_DRIVE')}
              className={`flex-1 py-2.5 text-xs font-medium transition ${
                rentalType === 'SELF_DRIVE'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-ink-600 hover:bg-ink-50'
              }`}
            >
              Tự lái
            </button>
            <button
              type="button"
              onClick={() => setRentalType('WITH_DRIVER')}
              className={`flex-1 py-2.5 text-xs font-medium transition ${
                rentalType === 'WITH_DRIVER'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-ink-600 hover:bg-ink-50'
              }`}
            >
              Có tài xế
            </button>
          </div>
        </div>

        {/* Search Button */}
        <div className={isHero ? 'md:col-span-2' : ''}>
          <button
            type="submit"
            className="w-full bg-brand-accent hover:bg-brand-accent-dark text-ink-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <Search className="w-4 h-4" />
            Tìm xe
          </button>
        </div>
      </div>
    </form>
  );
}
