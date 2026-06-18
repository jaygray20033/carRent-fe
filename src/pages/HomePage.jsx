import { Link } from 'react-router-dom';
import { Search, Shield, Headphones, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { carService } from '../services/carService.js';
import CarCard from '../components/car/CarCard.jsx';
import Loading from '../components/common/Loading.jsx';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['cars', { page: 1, limit: 6 }],
    queryFn: () => carService.list({ page: 1, limit: 6 }),
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Thuê xe ô tô nhanh chóng, minh bạch, an toàn 24/7
          </h1>
          <p className="mt-4 max-w-xl text-base text-primary-100 md:text-lg">
            Hàng nghìn xe đời mới — tự lái hoặc có tài xế. Đặt online chỉ trong 2 phút.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/cars" className="btn bg-white text-primary-700 hover:bg-gray-100">
              <Search className="h-4 w-4" />
              Tìm xe ngay
            </Link>
            <Link
              to="/register"
              className="btn border border-white/40 text-white hover:bg-white/10"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature icon={Shield} title="Bảo hiểm toàn diện">
            Mọi chuyến xe đều có gói bảo hiểm cơ bản, an tâm di chuyển.
          </Feature>
          <Feature icon={Headphones} title="Cứu hộ 24/7">
            Đội ngũ hỗ trợ khẩn cấp có mặt mọi lúc, mọi nơi.
          </Feature>
          <Feature icon={Car} title="Xe đa dạng">
            Sedan, SUV, MPV — đầy đủ phân khúc cho mọi nhu cầu.
          </Feature>
        </div>
      </section>

      {/* Featured cars */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Xe nổi bật</h2>
            <p className="text-sm text-gray-500">Các mẫu xe được khách hàng yêu thích nhất</p>
          </div>
          <Link to="/cars" className="text-sm font-medium text-primary-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data?.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Feature({ icon: Icon, title, children }) {
  return (
    <div className="card p-6">
      <div className="mb-3 inline-flex rounded-lg bg-primary-50 p-3 text-primary-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{children}</p>
    </div>
  );
}
