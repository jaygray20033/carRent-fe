// src/pages/ContactPage.jsx — Day 36 (UC-28/30). Figma: ContactUs.png
// Contact form (name/email/phone/subject/message) + Google Maps embed + info column.
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronRight, Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService } from '../services/contactService.js';
import Button from '../components/ui/Button.jsx';
import Input, { InputError } from '../components/ui/Input.jsx';

// Fallback mirrors the footer defaults until settings are seeded.
const FALLBACK = {
  hotline: '0986310849',
  email: 'contact@vflash.com.vn',
  address: '55 Đặng Nhữ Mai, Phường Cát Lái, Thành Phố Hồ Chí Minh, Việt Nam',
  hours: 'Thứ 2 - Thứ 7 | 8:00 AM - 5:20 PM',
};

const MAP_SRC =
  'https://www.google.com/maps?q=' +
  encodeURIComponent('Cát Lái, Thành phố Thủ Đức, Hồ Chí Minh') +
  '&output=embed';

export default function ContactPage() {
  const { data } = useQuery({
    queryKey: ['site-contact'],
    queryFn: () => contactService.publicContact(),
    staleTime: 60 * 60 * 1000,
  });
  const info = { ...FALLBACK, ...(data?.data ?? {}) };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const mutation = useMutation({
    mutationFn: (payload) => contactService.submit(payload),
    onSuccess: (res) => {
      toast.success(res?.message || 'Đã gửi liên hệ. Chúng tôi sẽ phản hồi sớm.');
      reset();
    },
    onError: (e) => toast.error(e?.message || 'Gửi liên hệ thất bại, vui lòng thử lại.'),
  });

  const onSubmit = (values) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    };
    if (values.phone?.trim()) payload.phone = values.phone.trim();
    if (values.subject?.trim()) payload.subject = values.subject.trim();
    mutation.mutate(payload);
  };

  const contactItems = [
    { icon: Phone, label: 'Hotline', value: info.hotline, href: `tel:${info.hotline}` },
    { icon: Mail, label: 'Email', value: info.email, href: `mailto:${info.email}` },
    { icon: MapPin, label: 'Địa chỉ', value: info.address },
    { icon: Clock, label: 'Giờ làm việc', value: info.hours },
  ];

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
            <span className="font-medium text-white">Liên hệ</span>
          </nav>
          <p className="mb-1 text-sm font-semibold text-brand-accent">Kết nối với OtoRent</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Liên hệ với chúng tôi</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Có câu hỏi hoặc cần hỗ trợ? Gửi tin nhắn cho chúng tôi hoặc liên hệ trực tiếp qua các
            kênh bên dưới.
          </p>
        </div>
      </section>

      <div className="container-app py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left — contact info + map */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100">
              <h2 className="mb-4 text-lg font-bold text-ink-900">Thông tin liên hệ</h2>
              <ul className="space-y-4">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase text-ink-400">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm font-medium text-ink-700 transition hover:text-brand-primary"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-ink-700">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl shadow-card ring-1 ring-ink-100">
              <iframe
                title="Bản đồ OtoRent"
                src={MAP_SRC}
                className="h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right — form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
              <h2 className="mb-1 text-lg font-bold text-ink-900">Gửi tin nhắn cho chúng tôi</h2>
              <p className="mb-6 text-sm text-ink-500">
                Điền vào biểu mẫu dưới đây, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Họ và tên *"
                    placeholder="Nguyễn Văn A"
                    error={errors.name?.message}
                    {...register('name', {
                      required: 'Vui lòng nhập họ tên',
                      minLength: { value: 2, message: 'Họ tên quá ngắn' },
                    })}
                  />
                  <Input
                    label="Email *"
                    type="email"
                    placeholder="email@example.com"
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Vui lòng nhập email',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' },
                    })}
                  />
                  <Input
                    label="Số điện thoại"
                    placeholder="0901234567"
                    error={errors.phone?.message}
                    {...register('phone', {
                      pattern: {
                        value: /^[0-9+\s-]{8,20}$/,
                        message: 'Số điện thoại không hợp lệ',
                      },
                    })}
                  />
                  <Input
                    label="Tiêu đề"
                    placeholder="Vấn đề bạn quan tâm"
                    {...register('subject')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-700">
                    Nội dung *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn (tối thiểu 10 ký tự)…"
                    className="input"
                    {...register('message', {
                      required: 'Vui lòng nhập nội dung',
                      minLength: { value: 10, message: 'Nội dung tối thiểu 10 ký tự' },
                    })}
                  />
                  {errors.message && <InputError message={errors.message.message} />}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={mutation.isPending}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Gửi tin nhắn
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
