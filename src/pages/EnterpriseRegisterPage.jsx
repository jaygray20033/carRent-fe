// src/pages/EnterpriseRegisterPage.jsx — Enterprise (doanh nghiệp) self-registration.
// Landing + instant self-register: any authenticated user creates a company and
// becomes its admin immediately (no OtoRent approval). On success we jump straight
// to the Enterprise Portal. Unlike the supplier flow, there is no review queue.
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Building2,
  Wallet,
  CalendarCheck,
  ShieldCheck,
  Send,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { enterpriseService } from '../services/enterpriseService.js';
import { useAuth } from '../hooks/useAuth.js';
import useUiStore from '../store/uiStore.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Loading from '../components/common/Loading.jsx';

const BENEFITS = [
  {
    icon: CalendarCheck,
    title: 'Đặt xe theo hợp đồng',
    desc: 'Đặt và quản lý chuyến đi cho nhân viên theo lịch, có luồng duyệt nội bộ.',
  },
  {
    icon: Wallet,
    title: 'Đối soát & công nợ',
    desc: 'Bảng giá riêng, hạn mức tín dụng và đối soát doanh thu định kỳ minh bạch.',
  },
  {
    icon: ShieldCheck,
    title: 'Cam kết dịch vụ (SLA)',
    desc: 'Theo dõi chất lượng chuyến đi và báo cáo vi phạm SLA ngay trên cổng.',
  },
];

export default function EnterpriseRegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const openAuthModal = useUiStore((s) => s.openAuthModal);

  // Detect an existing membership so we send returning users to the portal
  // instead of showing the form again.
  const { data: companyData, isLoading: checkingCompany } = useQuery({
    queryKey: ['myCompany', 'enterprise-register'],
    queryFn: () => enterpriseService.myCompany(),
    enabled: isAuthenticated,
    retry: false,
  });

  const existing = companyData?.data ?? companyData ?? {};
  const alreadyMember = Boolean(
    existing.company?.id || existing.corporate?.id || existing.membership?.corporateId
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (payload) => enterpriseService.selfRegister(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đăng ký doanh nghiệp thành công.');
      navigate('/enterprise');
    },
    onError: (e) => toast.error(e?.message || 'Đăng ký thất bại, vui lòng thử lại.'),
  });

  const submitRegistration = (values) => {
    const payload = {
      name: values.name.trim(),
      taxCode: values.taxCode.trim(),
      address: values.address.trim(),
    };
    if (values.contactName?.trim()) payload.contactName = values.contactName.trim();
    if (values.contactPhone?.trim()) payload.contactPhone = values.contactPhone.trim();
    if (values.contactEmail?.trim()) payload.contactEmail = values.contactEmail.trim();
    if (values.department?.trim()) payload.department = values.department.trim();
    mutation.mutate(payload);
  };

  // Guests may fill the form freely; auth is only required at submit time. We
  // open the login modal in place (keeping the entered values) and resume the
  // registration automatically once the user is signed in.
  const onSubmit = (values) => {
    if (!isAuthenticated) {
      openAuthModal('login', () => submitRegistration(values));
      return;
    }
    submitRegistration(values);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-900">
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/95 to-ink-800" />
        <div className="container-app relative z-10 py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-1.5 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">Đăng ký doanh nghiệp</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">OtoRent Business</p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Giải pháp thuê xe cho doanh nghiệp
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Tạo tài khoản doanh nghiệp để đặt xe theo hợp đồng, quản lý nhân viên và đối soát chi phí.
            Kích hoạt ngay — không cần chờ duyệt.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left — benefits */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <h2 className="mb-4 text-lg font-bold text-ink-900">Vì sao chọn OtoRent Business?</h2>
              <ul className="space-y-5">
                {BENEFITS.map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-800">{title}</p>
                      <p className="mt-0.5 text-sm text-ink-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right — form / login CTA / already-member notice */}
          <div className="lg:col-span-3">
            {isAuthenticated && checkingCompany ? (
              <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-ink-100">
                <Loading />
              </div>
            ) : isAuthenticated && alreadyMember ? (
              <AlreadyMemberCard />
            ) : (
              <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
                <h2 className="mb-1 text-lg font-bold text-ink-900">Thông tin doanh nghiệp</h2>
                <p className="mb-6 text-sm text-ink-500">
                  Điền thông tin bên dưới. Tài khoản của bạn sẽ trở thành quản trị doanh nghiệp ngay
                  sau khi đăng ký.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  <Input
                    label="Tên doanh nghiệp *"
                    placeholder="Công ty TNHH ABC"
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'Vui lòng nhập tên doanh nghiệp',
                      minLength: { value: 2, message: 'Tên quá ngắn' },
                    })}
                  />

                  <Input
                    label="Mã số thuế *"
                    placeholder="0301234567"
                    error={errors.taxCode?.message}
                    {...register('taxCode', {
                      required: 'Vui lòng nhập mã số thuế',
                      pattern: {
                        value: /^\d{10}(-?\d{0,3})?$/,
                        message: 'Mã số thuế phải gồm 10–13 chữ số',
                      },
                    })}
                  />

                  <Input
                    label="Địa chỉ *"
                    placeholder="55 Đặng Nhữ Mai, Cát Lái, TP.HCM"
                    error={errors.address?.message}
                    {...register('address', {
                      required: 'Vui lòng nhập địa chỉ',
                      minLength: { value: 3, message: 'Địa chỉ quá ngắn' },
                    })}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Người liên hệ"
                      placeholder="Nguyễn Văn A"
                      error={errors.contactName?.message}
                      {...register('contactName')}
                    />
                    <Input
                      label="Số điện thoại liên hệ"
                      placeholder="0901234567"
                      error={errors.contactPhone?.message}
                      {...register('contactPhone')}
                    />
                  </div>

                  <Input
                    label="Email liên hệ"
                    type="email"
                    placeholder="lienhe@doanhnghiep.vn"
                    error={errors.contactEmail?.message}
                    {...register('contactEmail', {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Email không hợp lệ',
                      },
                    })}
                  />

                  <Input
                    label="Phòng ban / chức vụ"
                    placeholder="Phòng hành chính"
                    error={errors.department?.message}
                    {...register('department')}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={mutation.isPending}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    Đăng ký & kích hoạt
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlreadyMemberCard() {
  return (
    <div className="rounded-2xl bg-white p-6 text-center shadow-card ring-1 ring-ink-100 md:p-8">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
        <Building2 className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-bold text-ink-900">Bạn đã thuộc một doanh nghiệp</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
        Tài khoản của bạn đã được liên kết với một doanh nghiệp. Truy cập cổng doanh nghiệp để quản
        lý đặt xe và đối soát.
      </p>
      <div className="mt-5 flex justify-center">
        <Link to="/enterprise" className="btn btn-primary btn-md">
          Vào cổng doanh nghiệp
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
