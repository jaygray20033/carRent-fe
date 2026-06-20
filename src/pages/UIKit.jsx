import { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Modal,
  Avatar,
  Rating,
  Breadcrumb,
  Skeleton,
  SkeletonCard,
  EmptyState,
  Pagination,
} from '@/components/ui';
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowRightIcon,
  CreditCardIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

/* ─────────────── Section Wrapper ─────────────── */
function Section({ title, description, children }) {
  return (
    <section className="mb-16">
      <div className="mb-6 border-b border-ink-100 pb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-ink-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-ink-800 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function DemoRow({ children, className = '' }) {
  return <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>;
}

/* ═══════════════════ MAIN ═══════════════════ */
export default function UIKit() {
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [switchOff, setSwitchOff] = useState(false);
  const [ratingVal, setRatingVal] = useState(3);
  const [page, setPage] = useState(3);

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ─── Hero Header ─── */}
      <header className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white">
        <div className="container-app py-12 md:py-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
              <span className="text-ink-900 font-bold text-lg">O</span>
            </div>
            <span className="text-2xl font-bold">OtoRent</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white mb-4">
            Design System
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Bộ component UI chuẩn cho OtoRent — nền thuê xe trực tuyến. Xây dựng dựa trên Figma 28
            màn hình, sử dụng React + Tailwind CSS v4.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="accent" size="lg">
              v1.0.0
            </Badge>
            <Badge variant="info" size="lg">
              React 19
            </Badge>
            <Badge variant="info" size="lg">
              Tailwind v4
            </Badge>
            <Badge variant="info" size="lg">
              HeadlessUI
            </Badge>
          </div>
        </div>
      </header>

      <main className="container-app py-12">
        {/* ═══════ 1. COLOR PALETTE ═══════ */}
        <Section title="Color Palette" description="Brand, Ink (neutral), Status colors">
          <SubSection title="Brand">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                ['Primary', 'bg-brand-primary', '#004EDE'],
                ['Primary Dark', 'bg-brand-primary-dark', '#0038A8'],
                ['Primary Light', 'bg-brand-primary-light', '#3B7CF7'],
                ['Accent', 'bg-brand-accent', '#FFB703'],
                ['Accent Dark', 'bg-brand-accent-dark', '#E59E00'],
              ].map(([name, cls, hex]) => (
                <div key={name} className="text-center">
                  <div className={`${cls} h-20 rounded-xl shadow-card`} />
                  <p className="mt-2 text-xs font-semibold text-ink-700">{name}</p>
                  <p className="text-xs text-ink-300">{hex}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Ink (Neutrals)">
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
              {[
                ['900', 'bg-ink-900', '#0A0F1F'],
                ['800', 'bg-ink-800', '#1A2238'],
                ['700', 'bg-ink-700', '#2D3656'],
                ['500', 'bg-ink-500', '#5B6478'],
                ['300', 'bg-ink-300', '#9AA3B5'],
                ['100', 'bg-ink-100', '#E5E8EF'],
                ['50', 'bg-ink-50 border border-ink-100', '#F5F7FB'],
              ].map(([name, cls, hex]) => (
                <div key={name} className="text-center">
                  <div className={`${cls} h-16 rounded-xl`} />
                  <p className="mt-2 text-xs font-semibold text-ink-700">ink-{name}</p>
                  <p className="text-xs text-ink-300">{hex}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Status">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Success', 'bg-success', '#1E9F5E'],
                ['Warning', 'bg-warning', '#F59E0B'],
                ['Danger', 'bg-danger', '#E53E3E'],
                ['Info', 'bg-info', '#3B82F6'],
              ].map(([name, cls, hex]) => (
                <div key={name} className="text-center">
                  <div className={`${cls} h-16 rounded-xl`} />
                  <p className="mt-2 text-xs font-semibold text-ink-700">{name}</p>
                  <p className="text-xs text-ink-300">{hex}</p>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ═══════ 2. TYPOGRAPHY ═══════ */}
        <Section title="Typography" description="Be Vietnam Pro — font family chính">
          <div className="space-y-6 bg-white rounded-2xl p-6 md:p-8 shadow-card">
            <div>
              <span className="text-xs font-mono text-ink-300 bg-ink-50 px-2 py-0.5 rounded">
                h1 · text-5xl · font-bold
              </span>
              <h1 className="text-5xl font-bold leading-tight mt-2">
                Thuê xe nhanh chóng, dễ dàng
              </h1>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-300 bg-ink-50 px-2 py-0.5 rounded">
                h2 · text-3xl · font-bold
              </span>
              <h2 className="text-3xl font-bold mt-2">Đặt xe tại OtoRent</h2>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-300 bg-ink-50 px-2 py-0.5 rounded">
                h3 · text-xl · font-semibold
              </span>
              <h3 className="text-xl font-semibold mt-2">Mercedes-Benz C300 2024</h3>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-300 bg-ink-50 px-2 py-0.5 rounded">
                body · text-base (16px)
              </span>
              <p className="text-base text-ink-700 mt-2">
                OtoRent với phương châm đặt niềm tin của khách hàng lên hàng đầu, tự hào sở hữu đội
                ngũ xe lớn nhất bao gồm đa dạng các dòng xe từ xe đời mới.
              </p>
            </div>
            <div>
              <span className="text-xs font-mono text-ink-300 bg-ink-50 px-2 py-0.5 rounded">
                caption · text-sm · text-ink-500
              </span>
              <p className="text-sm text-ink-500 mt-2">Năm sản xuất: 2024 · Thuê theo ngày</p>
            </div>
            <div className="flex flex-wrap gap-6 pt-4 border-t border-ink-100">
              <span className="font-normal text-ink-500">Regular 400</span>
              <span className="font-medium text-ink-500">Medium 500</span>
              <span className="font-semibold text-ink-500">Semibold 600</span>
              <span className="font-bold text-ink-500">Bold 700</span>
            </div>
          </div>
        </Section>

        {/* ═══════ 3. BUTTONS ═══════ */}
        <Section
          title="Buttons"
          description="Variants: primary, accent, outline, ghost, danger — Sizes: sm, md, lg"
        >
          <SubSection title="Variants">
            <DemoRow>
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </DemoRow>
          </SubSection>

          <SubSection title="Sizes">
            <DemoRow>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </DemoRow>
          </SubSection>

          <SubSection title="With Icons">
            <DemoRow>
              <Button variant="primary" leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}>
                Tìm xe
              </Button>
              <Button variant="accent" leftIcon={<CalendarIcon className="w-4 h-4" />}>
                Đặt lịch
              </Button>
              <Button variant="outline" rightIcon={<ArrowRightIcon className="w-4 h-4" />}>
                Xem thêm
              </Button>
              <Button variant="ghost" leftIcon={<HeartIcon className="w-4 h-4" />}>
                Yêu thích
              </Button>
            </DemoRow>
          </SubSection>

          <SubSection title="States">
            <DemoRow>
              <Button loading>Loading…</Button>
              <Button disabled>Disabled</Button>
              <Button variant="accent" loading>
                Đang xử lý
              </Button>
              <Button variant="outline" disabled>
                Không khả dụng
              </Button>
            </DemoRow>
          </SubSection>

          <SubSection title="Figma Reference — CTA Buttons">
            <DemoRow>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
              >
                Tìm xe ngay
              </Button>
              <Button variant="accent" size="lg">
                Yêu cầu đặt xe
              </Button>
              <Button variant="primary" size="md">
                Đăng nhập
              </Button>
              <Button variant="outline" size="md">
                Tiếp tục
              </Button>
            </DemoRow>
          </SubSection>
        </Section>

        {/* ═══════ 4. FORM ELEMENTS ═══════ */}
        <Section
          title="Form Elements"
          description="Input, Textarea, Select, Checkbox, Radio, Switch"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Inputs */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">Input</h3>
              <div className="space-y-4">
                <Input label="Số điện thoại di động" placeholder="09xx xxx xxx" />
                <Input
                  label="Email"
                  placeholder="email@example.com"
                  leftIcon={<EnvelopeIcon className="w-4 h-4" />}
                />
                <Input
                  label="Tìm kiếm"
                  placeholder="Nhập từ khóa..."
                  leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                />
                <Input
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••"
                  error="Mật khẩu không đúng"
                />
                <Input
                  label="Địa chỉ"
                  placeholder="55 Đặng Nhữ Mai..."
                  leftIcon={<MapPinIcon className="w-4 h-4" />}
                  helperText="Nhập địa chỉ nhận xe"
                />
              </div>
            </Card>

            {/* Textarea & Select */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">Textarea & Select</h3>
              <div className="space-y-4">
                <Textarea label="Mô tả" placeholder="Nhập mô tả xe..." rows={3} />
                <Textarea
                  label="Ghi chú"
                  placeholder="Nhập ghi chú..."
                  error="Ghi chú không được để trống"
                  rows={2}
                />
                <Select
                  label="Lọc biểu giá"
                  placeholder="Chọn biểu giá"
                  options={[
                    { value: 'daily', label: 'Thuê theo ngày' },
                    { value: 'monthly', label: 'Thuê theo tháng' },
                    { value: 'deposit', label: 'Tiền đặt cọc' },
                  ]}
                />
                <Select
                  label="Sắp xếp theo"
                  options={[
                    { value: 'price-asc', label: 'Giá tăng dần' },
                    { value: 'price-desc', label: 'Giá giảm dần' },
                    { value: 'newest', label: 'Mới nhất' },
                  ]}
                />
              </div>
            </Card>

            {/* Checkboxes & Radios */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">Checkbox & Radio</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-ink-700 mb-3">Thương hiệu xe</p>
                  <div className="space-y-2.5">
                    <Checkbox label="Thuê xe BMW" defaultChecked />
                    <Checkbox label="Thuê xe Peugeot" />
                    <Checkbox label="Thuê xe Porsche" />
                    <Checkbox label="Thuê xe Kia" />
                    <Checkbox label="Thuê xe Hyundai" />
                    <Checkbox label="Thuê xe Mercedes-Benz" defaultChecked />
                  </div>
                </div>
                <div className="pt-2 border-t border-ink-100">
                  <p className="text-sm font-medium text-ink-700 mb-3">Loại dịch vụ</p>
                  <div className="space-y-2.5">
                    <Radio name="service" label="Thuê xe có tài xế" defaultChecked />
                    <Radio name="service" label="Thuê xe tự lái" />
                    <Radio name="service" label="Thuê xe sang trọng" />
                    <Radio name="service" label="Thuê xe sự kiện" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Switch */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-ink-900 mb-4">Switch</h3>
              <div className="space-y-5">
                <Switch
                  enabled={switchOn}
                  onChange={setSwitchOn}
                  label="Nhận thông báo"
                  size="md"
                />
                <Switch enabled={switchOff} onChange={setSwitchOff} label="Chế độ tối" size="md" />
                <div className="pt-4 border-t border-ink-100">
                  <p className="text-sm font-medium text-ink-700 mb-3">Switch Sizes</p>
                  <div className="space-y-3">
                    <Switch enabled={true} onChange={() => {}} label="Small" size="sm" />
                    <Switch enabled={true} onChange={() => {}} label="Medium" size="md" />
                    <Switch enabled={true} onChange={() => {}} label="Large" size="lg" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* OTP Input Demo (matching Login modal) */}
          <SubSection title="OTP Input (Login Modal Style)">
            <Card padding="lg" className="max-w-md">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                    <span className="text-ink-900 font-bold text-sm">O</span>
                  </div>
                  <span className="font-bold text-ink-900">OtoRent</span>
                </div>
                <h3 className="text-lg font-bold text-ink-900">Xác nhận số điện thoại</h3>
                <p className="text-sm text-ink-500 mt-1">
                  Vui lòng nhập mã gồm 5 chữ số đã được gửi đến 0912215455
                </p>
              </div>
              <div className="flex justify-center gap-3 mb-4">
                {[9, 3, 5, 5, 9].map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    defaultValue={digit}
                    className="input w-12 h-12 text-center text-lg font-bold"
                    readOnly
                  />
                ))}
              </div>
              <div className="flex items-center justify-between text-sm mb-4">
                <button className="text-brand-primary font-medium hover:underline">
                  Thay đổi số điện thoại
                </button>
                <span className="text-ink-300 flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  Gửi lại sau <span className="text-brand-primary font-semibold">1:09</span>
                </span>
              </div>
              <Button variant="primary" className="w-full" size="lg">
                Đăng nhập
              </Button>
            </Card>
          </SubSection>
        </Section>

        {/* ═══════ 5. BADGES ═══════ */}
        <Section title="Badges" description="Status, discount, category labels">
          <SubSection title="Variants">
            <DemoRow>
              <Badge variant="primary">Có tài xế</Badge>
              <Badge variant="accent">Giảm 15%</Badge>
              <Badge variant="success">Đã xác minh</Badge>
              <Badge variant="warning">Đang chờ</Badge>
              <Badge variant="danger">Hết xe</Badge>
              <Badge variant="info">Mới</Badge>
              <Badge variant="neutral">Tự lái</Badge>
            </DemoRow>
          </SubSection>

          <SubSection title="With Dot">
            <DemoRow>
              <Badge variant="success" dot>
                Hoạt động
              </Badge>
              <Badge variant="warning" dot>
                Bảo trì
              </Badge>
              <Badge variant="danger" dot>
                Ngừng
              </Badge>
              <Badge variant="info" dot>
                Cập nhật
              </Badge>
            </DemoRow>
          </SubSection>

          <SubSection title="Sizes">
            <DemoRow>
              <Badge variant="primary" size="sm">
                Small
              </Badge>
              <Badge variant="primary" size="md">
                Medium
              </Badge>
              <Badge variant="primary" size="lg">
                Large
              </Badge>
            </DemoRow>
          </SubSection>
        </Section>

        {/* ═══════ 6. CARDS ═══════ */}
        <Section title="Cards" description="Wrapper component — shadow + radius mặc định">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Car Card – matching PLP */}
            {[
              {
                name: 'MERCEDES C300 2024',
                year: '2016',
                priceDay: '8,500,000',
                priceMonth: '8,500,000',
                deposit: '40,000,000',
              },
              {
                name: 'BMW 320i 2024',
                year: '2023',
                priceDay: '7,800,000',
                priceMonth: '7,500,000',
                deposit: '35,000,000',
              },
              {
                name: 'TOYOTA CAMRY 2024',
                year: '2024',
                priceDay: '5,200,000',
                priceMonth: '4,800,000',
                deposit: '25,000,000',
              },
            ].map((car, i) => (
              <Card key={i} hoverable padding="none" className="overflow-hidden">
                <div className="relative bg-ink-50 h-48 flex items-center justify-center">
                  <div className="w-32 h-20 bg-ink-200 rounded-lg flex items-center justify-center">
                    <TruckIcon className="w-10 h-10 text-ink-400" />
                  </div>
                  {i === 0 && (
                    <Badge variant="accent" size="sm" className="absolute top-3 right-3">
                      Hot
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-ink-900">{car.name}</h3>
                  <p className="text-xs text-ink-300 mt-0.5">Năm sản xuất: {car.year}</p>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-500">Thuê theo ngày</span>
                      <span className="font-bold text-brand-primary">
                        {car.priceDay} <span className="text-xs font-normal text-ink-300">VND</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Thuê theo tháng</span>
                      <span className="font-bold text-brand-primary">
                        {car.priceMonth}{' '}
                        <span className="text-xs font-normal text-ink-300">VND</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-500">Tiền đặt cọc</span>
                      <span className="font-semibold text-ink-700">
                        {car.deposit} <span className="text-xs font-normal text-ink-300">VND</span>
                      </span>
                    </div>
                  </div>
                  <Button variant="accent" className="w-full mt-4" size="md">
                    Yêu cầu đặt xe
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <SubSection title="Card with Header / Body / Footer">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Card padding="none">
                <CardHeader className="px-5 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-ink-900">Thông tin người dùng</h3>
                    <Badge variant="success" dot>
                      Đã xác minh
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="px-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-ink-300">Họ và Tên</p>
                      <p className="text-sm font-medium text-ink-900 mt-0.5">Nguyễn Khánh Vân</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-300">CCCD/CMND</p>
                      <p className="text-sm font-medium text-ink-900 mt-0.5">0035421253</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-300">Số điện thoại</p>
                      <p className="text-sm font-medium text-ink-900 mt-0.5">0912 345 678</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink-300">Email</p>
                      <p className="text-sm font-medium text-ink-900 mt-0.5">nkv@gmail.com</p>
                    </div>
                  </div>
                </CardBody>
                <CardFooter className="px-5 pb-5">
                  <Button variant="outline" size="sm">
                    Chỉnh sửa
                  </Button>
                </CardFooter>
              </Card>

              <Card padding="lg">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar name="Khánh Vân" size="xl" />
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">Khánh Vân</h3>
                    <p className="text-sm text-ink-300">0912 345 6789</p>
                    <Rating value={4.5} size="sm" showValue className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center py-4 border-t border-ink-100">
                  <div>
                    <p className="text-xl font-bold text-brand-primary">12</p>
                    <p className="text-xs text-ink-300">Chuyến đi</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-success">4.8</p>
                    <p className="text-xs text-ink-300">Đánh giá</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-brand-accent">VIP</p>
                    <p className="text-xs text-ink-300">Hạng</p>
                  </div>
                </div>
              </Card>
            </div>
          </SubSection>
        </Section>

        {/* ═══════ 7. MODAL ═══════ */}
        <Section title="Modal" description="@headlessui/react Dialog — backdrop đen mờ">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Mở Modal Đăng nhập
          </Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Đăng nhập" size="sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center">
                  <span className="text-ink-900 font-bold text-lg">O</span>
                </div>
                <span className="text-xl font-bold text-ink-900">OtoRent</span>
              </div>
              <p className="text-sm text-ink-500">
                Mã xác thực (OTP) sẽ được gửi tới số điện thoại di động
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Số điện thoại di động"
                leftIcon={<PhoneIcon className="w-4 h-4" />}
              />
              <p className="text-xs text-danger flex items-center gap-1">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                Thông tin này sẽ bí mật hoàn toàn
              </p>
              <Checkbox
                label={
                  <>
                    Bằng việc đăng nhập tôi đồng ý với{' '}
                    <a href="#" className="text-brand-primary underline">
                      các điều khoản
                    </a>{' '}
                    của OtoRent
                  </>
                }
              />
              <Button variant="primary" className="w-full" size="lg">
                Tiếp tục
              </Button>
            </div>
          </Modal>
        </Section>

        {/* ═══════ 8. AVATAR ═══════ */}
        <Section title="Avatar" description="Ảnh đại diện người dùng">
          <SubSection title="Sizes">
            <DemoRow>
              <Avatar name="NV" size="xs" />
              <Avatar name="Nguyễn Văn" size="sm" />
              <Avatar name="Khánh Vân" size="md" />
              <Avatar name="Trần Minh" size="lg" />
              <Avatar name="OtoRent" size="xl" />
              <Avatar name="Admin" size="2xl" />
            </DemoRow>
          </SubSection>
          <SubSection title="With Image">
            <DemoRow>
              <Avatar src="https://i.pravatar.cc/80?img=5" name="User 1" size="lg" />
              <Avatar src="https://i.pravatar.cc/80?img=12" name="User 2" size="lg" />
              <Avatar src="https://i.pravatar.cc/80?img=32" name="User 3" size="lg" />
            </DemoRow>
          </SubSection>
        </Section>

        {/* ═══════ 9. RATING ═══════ */}
        <Section title="Rating" description="Star rating — static & interactive">
          <div className="space-y-4">
            <DemoRow>
              <span className="text-sm text-ink-500 w-24">Read-only:</span>
              <Rating value={4.5} showValue />
            </DemoRow>
            <DemoRow>
              <span className="text-sm text-ink-500 w-24">Interactive:</span>
              <Rating value={ratingVal} interactive onChange={setRatingVal} showValue />
              <span className="text-xs text-ink-300">(Click to rate)</span>
            </DemoRow>
            <DemoRow>
              <span className="text-sm text-ink-500 w-24">Sizes:</span>
              <Rating value={3.5} size="sm" />
              <Rating value={3.5} size="md" />
              <Rating value={3.5} size="lg" />
            </DemoRow>
          </div>
        </Section>

        {/* ═══════ 10. BREADCRUMB ═══════ */}
        <Section title="Breadcrumb" description="Điều hướng phân tầng">
          <div className="space-y-3">
            <Breadcrumb
              items={[
                { label: 'OtoRent' },
                { label: 'Thuê xe', href: '#' },
                { label: 'Mercedes-Benz S500' },
              ]}
            />
            <Breadcrumb items={[{ label: 'OtoRent' }, { label: 'FAQ' }]} />
            <Breadcrumb
              items={[{ label: 'Tài khoản', href: '#' }, { label: 'Thông tin người dùng' }]}
            />
          </div>
        </Section>

        {/* ═══════ 11. SKELETON ═══════ */}
        <Section title="Skeleton" description="Loading placeholders">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="mt-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <div className="flex gap-4 mt-4">
              <Skeleton variant="circle" className="w-12 h-12" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-32" />
                <Skeleton variant="text" className="w-48" />
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════ 12. EMPTY STATE ═══════ */}
        <Section title="Empty State" description="Khi không có dữ liệu">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <EmptyState
                title="Chưa có chuyến đi nào"
                description="Bạn chưa đặt xe lần nào. Hãy bắt đầu thuê xe ngay!"
                actionLabel="Thuê xe ngay"
                action={() => {}}
              />
            </Card>
            <Card>
              <EmptyState
                icon={CreditCardIcon}
                title="Chưa có lịch sử thanh toán"
                description="Lịch sử thanh toán sẽ hiển thị ở đây sau khi bạn hoàn tất giao dịch."
              />
            </Card>
          </div>
        </Section>

        {/* ═══════ 13. PAGINATION ═══════ */}
        <Section title="Pagination" description="Phân trang danh sách">
          <div className="space-y-6">
            <Card padding="md">
              <p className="text-sm text-ink-500 text-center mb-4">Page: {page} / 10</p>
              <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
            </Card>
            <Card padding="md">
              <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
            </Card>
          </div>
        </Section>

        {/* ═══════ 14. SHADOWS & RADIUS ═══════ */}
        <Section title="Shadows & Radius" description="Tokens thiết kế cho shadow và border-radius">
          <SubSection title="Box Shadows">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                ['card', 'shadow-card', '0 4px 16px rgba(10,15,31,0.06)'],
                ['card-hover', 'shadow-card-hover', '0 8px 24px rgba(10,15,31,0.10)'],
                ['modal', 'shadow-modal', '0 20px 60px rgba(10,15,31,0.20)'],
              ].map(([name, cls, val]) => (
                <div key={name} className={`bg-white p-6 rounded-2xl ${cls} text-center`}>
                  <p className="font-semibold text-ink-900">{name}</p>
                  <p className="text-xs text-ink-300 mt-1 break-all">{val}</p>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Border Radius">
            <div className="flex flex-wrap gap-6">
              {[
                ['8px (btn/input)', 'rounded-lg', 'w-24 h-16'],
                ['16px (card/modal)', 'rounded-2xl', 'w-24 h-16'],
                ['Full (avatar)', 'rounded-full', 'w-16 h-16'],
              ].map(([name, cls, size]) => (
                <div key={name} className="text-center">
                  <div
                    className={`${size} ${cls} bg-brand-primary/10 border-2 border-brand-primary/30 mx-auto`}
                  />
                  <p className="text-xs font-medium text-ink-700 mt-2">{name}</p>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ═══════ 15. SPACING ═══════ */}
        <Section title="Spacing Guide" description="Container, section padding, gap standards">
          <Card padding="lg">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4">
                <code className="bg-ink-50 px-2 py-1 rounded text-xs font-mono min-w-[200px]">
                  container-app
                </code>
                <span className="text-ink-500">max-w-7xl mx-auto px-4 md:px-6 lg:px-8</span>
              </div>
              <div className="flex items-center gap-4">
                <code className="bg-ink-50 px-2 py-1 rounded text-xs font-mono min-w-[200px]">
                  Section padding
                </code>
                <span className="text-ink-500">py-16 md:py-24</span>
              </div>
              <div className="flex items-center gap-4">
                <code className="bg-ink-50 px-2 py-1 rounded text-xs font-mono min-w-[200px]">
                  Card padding
                </code>
                <span className="text-ink-500">p-5 (md) | p-6 md:p-8 (lg)</span>
              </div>
              <div className="flex items-center gap-4">
                <code className="bg-ink-50 px-2 py-1 rounded text-xs font-mono min-w-[200px]">
                  Gap (grid/flex)
                </code>
                <span className="text-ink-500">gap-4 (tight) | gap-6 (normal) | gap-8 (wide)</span>
              </div>
            </div>
          </Card>
        </Section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="bg-ink-900 text-white py-12">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
                  <span className="text-ink-900 font-bold text-sm">O</span>
                </div>
                <span className="text-lg font-bold">OtoRent</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                OtoRent với phương châm đặt niềm tin của khách hàng lên hàng đầu, tự hào sở hữu đội
                ngũ xe lớn nhất.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" /> 0983930849
                </li>
                <li className="flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" /> contact@vflash.com.vn
                </li>
                <li className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" /> 55 Đặng Nhữ Mai, Phường Cát Lái
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Đăng ký</h4>
              <p className="text-sm text-white/60 mb-3">Nhập email để nhận thông tin mới nhất.</p>
              <div className="flex gap-2">
                <input
                  className="input bg-ink-800 border-ink-700 text-white placeholder-ink-500 flex-1"
                  placeholder="Email"
                />
                <Button variant="accent" size="md">
                  Gửi đi
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-ink-800 mt-8 pt-6 text-center text-xs text-white/40">
            © 2024 OtoRent. All rights reserved. — Design System v1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}
