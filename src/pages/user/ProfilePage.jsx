// src/pages/user/ProfilePage.jsx
// UC-37/38/39 — "Thông tin người dùng" (Figma: UserAccount-Info.png).
// A 2-column grid of read-only fields; each has a verified badge (where
// applicable) and a pencil that opens an edit modal. Avatar upload with preview.
// Phone/password edits route to their dedicated 2-step / verify flows.
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Check, X, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService.js';
import { useAuthStore } from '../../store/authStore.js';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';

const GENDER_LABELS = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
};
// ISO date string → yyyy-mm-dd for <input type="date">
const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

function VerifiedBadge({ ok }) {
  return ok ? (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-white">
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  ) : (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white">
      <X className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

function Field({ label, value, verified, onEdit }) {
  return (
    <div className="flex items-start justify-between border-b border-ink-100 py-4">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-xs text-ink-400">{label}</span>
          {verified !== undefined && <VerifiedBadge ok={verified} />}
        </div>
        <p className="truncate font-medium text-ink-900">
          {value || <span className="text-ink-300">—</span>}
        </p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="ml-3 shrink-0 rounded-lg p-2 text-ink-300 transition-colors hover:bg-ink-50 hover:text-brand-primary"
          title={`Chỉnh sửa ${label}`}
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef(null);

  const { data, isLoading } = useQuery({ queryKey: ['me'], queryFn: () => userService.me() });
  const user = data?.data?.user;

  // Inline edit modal: { key, label, type, value } | null
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const patchMutation = useMutation({
    mutationFn: (payload) => userService.updateMe(payload),
    onSuccess: (res) => {
      const updated = res?.data?.user;
      if (updated) setUser(updated);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Cập nhật thành công');
      setEditing(null);
    },
    onError: (e) => toast.error(e?.message || 'Cập nhật thất bại'),
  });

  const avatarMutation = useMutation({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: (res) => {
      const updated = res?.data?.user;
      if (updated) setUser(updated);
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Đã cập nhật ảnh đại diện');
    },
    onError: (e) => toast.error(e?.message || 'Tải ảnh thất bại'),
  });

  if (isLoading) return <Loading />;

  const openEdit = (key, label, type = 'text', value = '') => {
    setDraft(value ?? '');
    setEditing({ key, label, type });
  };

  const saveEdit = () => {
    if (!editing) return;
    let value = draft;
    if (editing.type === 'date') value = value ? new Date(value).toISOString() : undefined;
    patchMutation.mutate({ [editing.key]: value });
  };

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
    e.target.value = '';
  };

  const displayName = user?.fullName || 'Người dùng';
  const avatar =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=004ede&color=fff`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      {/* Header: avatar + name */}
      <div className="mb-6 flex items-center gap-4 border-b border-ink-100 pb-6">
        <div className="relative">
          <img
            src={avatar}
            alt={displayName}
            className="h-20 w-20 rounded-full object-cover ring-2 ring-ink-100"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={avatarMutation.isPending}
            className="absolute -bottom-1 -right-1 rounded-full bg-brand-primary p-1.5 text-white shadow-card transition-transform hover:scale-105 disabled:opacity-60"
            title="Đổi ảnh đại diện"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onPickAvatar}
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">Thông tin người dùng</h1>
          <p className="text-sm text-ink-400">{user?.phone}</p>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
        <Field
          label="Họ và Tên"
          value={user?.fullName}
          onEdit={() => openEdit('fullName', 'Họ và Tên', 'text', user?.fullName)}
        />
        <Field
          label="CCCD / CMND"
          value={user?.nationalId}
          verified={Boolean(user?.nationalId)}
          onEdit={() => openEdit('nationalId', 'CCCD / CMND', 'text', user?.nationalId)}
        />

        <Field
          label="Số điện thoại"
          value={user?.phone}
          verified={Boolean(user?.phoneVerifiedAt)}
          onEdit={() => navigate('/me/change-phone')}
        />
        <Field
          label="Email"
          value={user?.email}
          verified={Boolean(user?.emailVerifiedAt)}
          onEdit={() => openEdit('email', 'Email', 'email', user?.email)}
        />

        <Field
          label="Mật khẩu"
          value="••••••••"
          onEdit={() => navigate('/me/change-password')}
        />
        <Field
          label="GPLX"
          value={user?.driverLicense}
          verified={Boolean(user?.driverLicense)}
          onEdit={() => openEdit('driverLicense', 'GPLX', 'text', user?.driverLicense)}
        />

        <Field
          label="Ngày sinh"
          value={fmtDate(user?.dateOfBirth)}
          onEdit={() => openEdit('dateOfBirth', 'Ngày sinh', 'date', toDateInput(user?.dateOfBirth))}
        />
        <Field
          label="Giới tính"
          value={GENDER_LABELS[user?.gender]}
          onEdit={() => openEdit('gender', 'Giới tính', 'gender', user?.gender || 'MALE')}
        />
      </div>

      {/* Inline edit modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Chỉnh sửa ${editing.label}` : ''}
        size="sm"
      >
        {editing?.type === 'gender' ? (
          <Select
            label={editing.label}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            options={GENDER_OPTIONS}
          />
        ) : (
          <Input
            label={editing?.label}
            type={editing?.type || 'text'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setEditing(null)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={saveEdit} loading={patchMutation.isPending}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
}
