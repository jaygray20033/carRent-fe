// src/pages/SupplierRegisterPage.jsx — Marketplace supplier (nhà xe) onboarding.
// Landing + supplier partner application form. If the user already has an
// application, show its status instead of the form. Mirrors AgentRegisterPage.
import { useForm, useWatch } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Warehouse, TrendingUp, ShieldCheck, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerService } from '../services/partnerService.js';
import { useAuth } from '../hooks/useAuth.js';
import useUiStore from '../store/uiStore.js';
import { formatDateTime } from '../utils/format.js';
import Button from '../components/ui/Button.jsx';
import Input, { InputError } from '../components/ui/Input.jsx';
import Loading from '../components/common/Loading.jsx';

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Mở rộng đội xe',
    desc: 'Đưa toàn bộ đội xe của nhà xe lên nền tảng và tiếp cận khách thuê trên cả nước.',
  },
  {
    icon: ShieldCheck,
    title: 'Quản lý tập trung',
    desc: 'Theo dõi đơn thuê, đối soát doanh thu và quản lý thành viên trong một cổng riêng.',
  },
  {
    icon: Warehouse,
    title: 'Vận hành chuyên nghiệp',
    desc: 'Công cụ dành cho nhà xe quy mô lớn: phân quyền nhân sự, đối soát định kỳ.',
  },
];

const STATUS_META = {
  PENDING: {
    icon: Clock,
    label: 'Đang chờ duyệt',
    tone: 'bg-warning/10 text-warning',
    note: 'Đơn của bạn đang được xem xét. Chúng tôi sẽ phản hồi trong 1-3 ngày làm việc.',
  },
  APPROVED: {
    icon: CheckCircle2,
    label: 'Đã được duyệt',
    tone: 'bg-success/10 text-success',
    note: 'Chúc mừng! Nhà xe của bạn đã được kích hoạt. Bạn có thể truy cập cổng nhà xe.',
  },
  REJECTED: {
    icon: XCircle,
    label: 'Đã bị từ chối',
    tone: 'bg-danger/10 text-danger',
    note: 'Rất tiếc, đơn đăng ký của bạn chưa được duyệt. Bạn có thể gửi lại đơn mới.',
  },
};

export default function SupplierRegisterPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const openAuthModal = useUiStore((s) => s.openAuthModal);

  // Only probe the applicant's status once signed in — a guest hitting this
  // (401) endpoint would trip the global interceptor and get bounced to /login.
  const { data, isLoading } = useQuery({
    queryKey: ['mySupplierApplication'],
    queryFn: () => partnerService.mySupplier(),
    enabled: isAuthenticated,
  });

  const application = isAuthenticated ? data?.data?.application ?? null : null;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { applicantType: 'BUSINESS' } });

  const applicantType = useWatch({ control, name: 'applicantType' });

  const mutation = useMutation({
    mutationFn: ({ payload, file }) => partnerService.submitSupplier(payload, file),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã gửi đơn đăng ký nhà xe.');
      reset();
      queryClient.invalidateQueries({ queryKey: ['mySupplierApplication'] });
    },
    onError: (e) => toast.error(e?.message || 'Gửi đơn thất bại, vui lòng thử lại.'),
  });

  const submitApplication = (values) => {
    const payload = {
      applicantType: values.applicantType,
      companyName: values.companyName.trim(),
      address: values.address.trim(),
    };
    if (values.taxCode?.trim()) payload.taxCode = values.taxCode.trim();
    if (values.contactName?.trim()) payload.contactName = values.contactName.trim();
    if (values.contactPhone?.trim()) payload.contactPhone = values.contactPhone.trim();
    if (values.contactEmail?.trim()) payload.contactEmail = values.contactEmail.trim();
    if (values.note?.trim()) payload.note = values.note.trim();
    const file = values.licenseFile?.[0];
    mutation.mutate({ payload, file });
  };

  // Guests may fill the form freely; auth is only required at submit time. We
  // open the login modal in place (keeping the entered values) and resume the
  // submission automatically once the user is signed in.
  const onSubmit = (values) => {
    if (!isAuthenticated) {
      openAuthModal('login', () => submitApplication(values));
      return;
    }
    submitApplication(values);
  };

  // A pending/approved application blocks re-submission; rejected can re-apply.
  const showForm = !application || application.status === 'REJECTED';

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
            <span className="font-medium text-white">Đăng ký nhà xe</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">Đối tác nhà xe OtoRent</p>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Đưa nhà xe của bạn lên OtoRent
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Đăng ký trở thành nhà xe đối tác để quản lý đội xe, nhận đơn thuê và đối soát doanh thu
            trên cổng nhà xe chuyên biệt.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left — benefits */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <h2 className="mb-4 text-lg font-bold text-ink-900">Vì sao chọn OtoRent?</h2>
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

          {/* Right — form or status */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="rounded-2xl bg-white p-8 shadow-card ring-1 ring-ink-100">
                <Loading />
              </div>
            ) : (
              <>
                {application && <StatusCard application={application} />}

                {showForm && (
                  <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
                    <h2 className="mb-1 text-lg font-bold text-ink-900">Đơn đăng ký nhà xe</h2>
                    <p className="mb-6 text-sm text-ink-500">
                      Điền thông tin dưới đây. Đội ngũ OtoRent sẽ xét duyệt và kích hoạt nhà xe.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      {/* Applicant type */}
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-ink-700">
                          Loại đối tác *
                        </label>
                        <div className="flex gap-3">
                          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary/5">
                            <input
                              type="radio"
                              value="INDIVIDUAL"
                              {...register('applicantType')}
                            />
                            Cá nhân
                          </label>
                          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm has-[:checked]:border-brand-primary has-[:checked]:bg-brand-primary/5">
                            <input
                              type="radio"
                              value="BUSINESS"
                              {...register('applicantType')}
                            />
                            Doanh nghiệp
                          </label>
                        </div>
                      </div>

                      <Input
                        label={applicantType === 'BUSINESS' ? 'Tên nhà xe / doanh nghiệp *' : 'Họ và tên *'}
                        placeholder={
                          applicantType === 'BUSINESS' ? 'Nhà xe Phương Trang' : 'Nguyễn Văn A'
                        }
                        error={errors.companyName?.message}
                        {...register('companyName', {
                          required: 'Vui lòng nhập tên',
                          minLength: { value: 2, message: 'Tên quá ngắn' },
                        })}
                      />

                      {applicantType === 'BUSINESS' && (
                        <Input
                          label="Mã số thuế (MST)"
                          placeholder="0301234567"
                          error={errors.taxCode?.message}
                          {...register('taxCode', {
                            pattern: {
                              value: /^[0-9-]{8,20}$/,
                              message: 'Mã số thuế không hợp lệ',
                            },
                          })}
                        />
                      )}

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
                        placeholder="lienhe@nhaxe.vn"
                        error={errors.contactEmail?.message}
                        {...register('contactEmail', {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Email không hợp lệ',
                          },
                        })}
                      />

                      <div>
                        <label
                          htmlFor="licenseFile"
                          className="mb-1.5 block text-sm font-medium text-ink-700"
                        >
                          Giấy phép kinh doanh
                        </label>
                        <input
                          id="licenseFile"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className="block w-full text-sm text-ink-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-primary hover:file:bg-brand-primary/20"
                          {...register('licenseFile')}
                        />
                        <p className="mt-1 text-xs text-ink-400">
                          Ảnh giấy phép kinh doanh hoặc giấy tờ nhà xe (PNG/JPG, tối đa 5MB).
                        </p>
                      </div>

                      <div>
                        <label
                          htmlFor="note"
                          className="mb-1.5 block text-sm font-medium text-ink-700"
                        >
                          Ghi chú
                        </label>
                        <textarea
                          id="note"
                          rows={4}
                          placeholder="Thông tin thêm về đội xe hoặc nhu cầu hợp tác…"
                          className="input"
                          {...register('note')}
                        />
                        {errors.note && <InputError message={errors.note.message} />}
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={mutation.isPending}
                        leftIcon={<Send className="h-4 w-4" />}
                      >
                        Gửi đơn đăng ký
                      </Button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ application }) {
  const meta = STATUS_META[application.status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <div className="mb-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${meta.tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-ink-900">Đơn đăng ký của bạn</p>
            <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}>
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">{meta.note}</p>
          {application.status === 'APPROVED' && (
            <Link
              to="/supplier"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:underline"
            >
              Vào cổng nhà xe
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          {application.reviewNote && application.status === 'REJECTED' && (
            <p className="mt-2 rounded-lg bg-danger/5 p-2.5 text-sm text-danger">
              Lý do: {application.reviewNote}
            </p>
          )}
          <p className="mt-2 text-xs text-ink-400">
            Gửi lúc {formatDateTime(application.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
