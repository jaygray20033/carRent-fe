// src/pages/admin/UserDetailPage.jsx
// Admin user detail (Day 34 — UC-55). Profile + status/role controls +
// manual wallet adjust, alongside booking history, wallet transactions,
// and reviews written by the user.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  Unlock,
  Shield,
  Wallet,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminUserService } from '../../services/adminService.js';
import { useAuthStore } from '../../store/authStore.js';
import { formatCurrency, formatDateTime } from '../../utils/format.js';
import { statusLabel, statusColor } from '../../utils/bookingStatus.js';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Input from '../../components/ui/Input.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loading from '../../components/common/Loading.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'ADMIN', label: 'Quản trị' },
  { value: 'OPERATOR', label: 'Điều hành' },
  { value: 'AGENT', label: 'Nhân viên' },
];

const USER_STATUS_BADGE = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  LOCKED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
};
const USER_STATUS_LABEL = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Đã khóa',
  PENDING: 'Chờ kích hoạt',
};

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = (currentUser?.roleCode || currentUser?.role?.code) === 'ADMIN';

  const [lockOpen, setLockOpen] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [role, setRole] = useState('');
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletType, setWalletType] = useState('CREDIT');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletNote, setWalletNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => adminUserService.detail(id),
  });

  const payload = unwrap(data);
  const user = payload.user;
  const bookings = Array.isArray(payload.bookings) ? payload.bookings : [];
  const wallet = payload.wallet;
  const transactions = Array.isArray(wallet?.transactions) ? wallet.transactions : [];
  const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
    queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
  };

  const statusMutation = useMutation({
    mutationFn: (body) => adminUserService.updateStatus(id, body),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái tài khoản');
      setLockOpen(false);
      setLockReason('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể cập nhật trạng thái'),
  });

  const roleMutation = useMutation({
    mutationFn: (roleCode) => adminUserService.updateRole(id, roleCode),
    onSuccess: () => {
      toast.success('Đã cập nhật vai trò');
      setRoleOpen(false);
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể cập nhật vai trò'),
  });

  const walletMutation = useMutation({
    mutationFn: (body) => adminUserService.adjustWallet(id, body),
    onSuccess: () => {
      toast.success('Đã điều chỉnh ví');
      setWalletOpen(false);
      setWalletAmount('');
      setWalletNote('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể điều chỉnh ví'),
  });

  if (isLoading) return <Loading />;

  if (!user || !user.id) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
        <p className="text-ink-500">Không tìm thấy người dùng.</p>
        <button
          onClick={() => navigate('/admin/users')}
          className="mt-4 text-brand-primary hover:underline"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const isLocked = user.status === 'LOCKED';
  const isSelf = Number(currentUser?.id) === Number(user.id);

  const openLock = () => {
    if (isLocked) {
      // Unlock is immediate — no reason needed.
      statusMutation.mutate({ status: 'ACTIVE' });
    } else {
      setLockReason('');
      setLockOpen(true);
    }
  };

  const openRole = () => {
    setRole(user.role?.code || 'CUSTOMER');
    setRoleOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
            USER_STATUS_BADGE[user.status] || 'bg-ink-100 text-ink-500'
          }`}
        >
          {USER_STATUS_LABEL[user.status] || user.status}
        </span>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        {!isSelf && (
          <Button
            variant={isLocked ? 'primary' : 'danger'}
            size="sm"
            leftIcon={isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            onClick={openLock}
            disabled={statusMutation.isPending}
          >
            {isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
          </Button>
        )}
        {isAdmin && !isSelf && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Shield className="h-4 w-4" />}
            onClick={openRole}
          >
            Đổi vai trò
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Wallet className="h-4 w-4" />}
          onClick={() => setWalletOpen(true)}
        >
          Điều chỉnh ví
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left — profile + wallet */}
        <div className="space-y-5">
          {/* Profile */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-50">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 text-ink-300" />
                )}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-ink-700">{user.fullName || '—'}</h1>
                <p className="text-xs text-ink-300">{user.role?.name || user.role?.code || '—'}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-ink-500">
              {user.phone && (
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-ink-300" />
                  {user.phone}
                </p>
              )}
              {user.email && (
                <p className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ink-300" />
                  {user.email}
                </p>
              )}
              <p className="text-xs text-ink-300">Tham gia {formatDateTime(user.createdAt)}</p>
            </div>
          </div>

          {/* Wallet */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-700">
              <Wallet className="h-4 w-4" />
              Ví
            </h2>
            <p className="text-2xl font-bold text-brand-primary">
              {formatCurrency(wallet?.balance ?? 0)}
            </p>
            {transactions.length > 0 && (
              <div className="mt-3 space-y-2">
                {transactions.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-ink-700">{t.description || t.type}</p>
                      <p className="text-[11px] text-ink-300">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <span
                      className={`shrink-0 font-medium ${
                        t.amount < 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {t.amount < 0 ? '' : '+'}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — bookings + reviews */}
        <div className="space-y-5 lg:col-span-2">
          {/* Bookings */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Lịch sử đơn thuê</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-ink-300">Chưa có đơn nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                      <th className="px-3 py-2 font-medium">Mã</th>
                      <th className="px-3 py-2 font-medium">Xe</th>
                      <th className="px-3 py-2 font-medium">Nhận</th>
                      <th className="px-3 py-2 font-medium">Trạng thái</th>
                      <th className="px-3 py-2 text-right font-medium">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr
                        key={b.id}
                        className="cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                        onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      >
                        <td className="px-3 py-2 font-mono text-xs text-ink-700">{b.bookingCode}</td>
                        <td className="px-3 py-2 text-ink-500">{b.vehicle?.name || '—'}</td>
                        <td className="px-3 py-2 text-ink-500">{formatDateTime(b.pickupAt)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusColor(b.status)}`}
                          >
                            {statusLabel(b.status)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-ink-700">
                          {formatCurrency(b.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
            <h2 className="mb-3 text-sm font-semibold text-ink-700">Đánh giá</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-ink-300">Chưa có đánh giá nào.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl bg-ink-50/60 p-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-700">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {r.rating}/5
                      </span>
                      <span className="text-[11px] text-ink-300">{formatDateTime(r.createdAt)}</span>
                    </div>
                    {r.content && <p className="mt-1 text-sm text-ink-500">{r.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lock modal */}
      <Modal open={lockOpen} onClose={() => setLockOpen(false)} title="Khóa tài khoản">
        <p className="text-sm text-ink-500">
          Khóa tài khoản sẽ đăng xuất mọi phiên đang hoạt động của người dùng này.
        </p>
        <div className="mt-4">
          <Textarea
            label="Lý do"
            rows={3}
            value={lockReason}
            onChange={(e) => setLockReason(e.target.value)}
            placeholder="Nhập lý do khóa (không bắt buộc)…"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLockOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              statusMutation.mutate({
                status: 'LOCKED',
                ...(lockReason.trim() ? { reason: lockReason.trim() } : {}),
              })
            }
            disabled={statusMutation.isPending}
          >
            Khóa tài khoản
          </Button>
        </div>
      </Modal>

      {/* Role modal */}
      <Modal open={roleOpen} onClose={() => setRoleOpen(false)} title="Đổi vai trò">
        <p className="text-sm text-ink-500">
          Thay đổi vai trò sẽ cập nhật quyền truy cập của người dùng này.
        </p>
        <div className="mt-4">
          <Select
            label="Vai trò"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setRoleOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => roleMutation.mutate(role)}
            disabled={roleMutation.isPending}
          >
            Cập nhật
          </Button>
        </div>
      </Modal>

      {/* Wallet adjust modal */}
      <Modal open={walletOpen} onClose={() => setWalletOpen(false)} title="Điều chỉnh ví">
        <p className="text-sm text-ink-500">
          Cộng hoặc trừ tiền thủ công vào ví của người dùng. Giao dịch được ghi lại.
        </p>
        <div className="mt-4 space-y-3">
          <Select
            label="Loại"
            value={walletType}
            onChange={(e) => setWalletType(e.target.value)}
            options={[
              { value: 'CREDIT', label: 'Cộng tiền (CREDIT)' },
              { value: 'DEBIT', label: 'Trừ tiền (DEBIT)' },
            ]}
          />
          <Input
            type="number"
            label="Số tiền (VND)"
            value={walletAmount}
            onChange={(e) => setWalletAmount(e.target.value)}
            placeholder="0"
            min="1"
          />
          <Textarea
            label="Ghi chú"
            rows={2}
            value={walletNote}
            onChange={(e) => setWalletNote(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setWalletOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              walletMutation.mutate({
                type: walletType,
                amount: Number(walletAmount),
                ...(walletNote.trim() ? { note: walletNote.trim() } : {}),
              })
            }
            disabled={!walletAmount || Number(walletAmount) <= 0 || walletMutation.isPending}
          >
            Xác nhận
          </Button>
        </div>
      </Modal>
    </div>
  );
}
