// src/pages/enterprise/EmployeesPage.jsx — Corporate Admin employee management.
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus, Users, Copy, RefreshCw, Trash2, Link2, Ban, Zap } from 'lucide-react';
import { enterpriseService } from '../../services/enterpriseService.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const unwrap = (res) => res?.data ?? res ?? {};
const EMPTY_INVITE = { phone: '', email: '', department: '', employeeCode: '', isAdmin: false };

export default function EnterpriseEmployeesPage() {
  const { isAdmin, corporate } = useOutletContext() || {};
  const queryClient = useQueryClient();
  const autoApprove = Boolean(corporate?.autoApproveBookings);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState(EMPTY_INVITE);
  const [inviteToken, setInviteToken] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['enterprise', 'employees'],
    queryFn: () => enterpriseService.listEmployees({ size: 100 }),
    enabled: Boolean(isAdmin),
  });

  const raw = unwrap(data);
  const items = Array.isArray(raw) ? raw : raw.items || [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['enterprise', 'employees'] });

  const autoApproveMutation = useMutation({
    mutationFn: (next) => enterpriseService.updateMyCompany({ autoApproveBookings: next }),
    onSuccess: (_res, next) => {
      toast.success(
        next ? 'Đã bật tự động duyệt chuyến' : 'Đã tắt tự động duyệt chuyến'
      );
      queryClient.invalidateQueries({ queryKey: ['enterprise', 'myCompany'] });
    },
    onError: (err) => toast.error(err?.message || 'Không thể cập nhật cài đặt'),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      enterpriseService.inviteEmployee({
        phone: invite.phone || undefined,
        email: invite.email || undefined,
        department: invite.department || undefined,
        employeeCode: invite.employeeCode || undefined,
        isAdmin: invite.isAdmin,
      }),
    onSuccess: (res) => {
      setInviteToken(unwrap(res).inviteToken || '');
      toast.success('Đã gửi lời mời');
      invalidate();
    },
    onError: (err) => toast.error(err?.message || 'Không thể gửi lời mời'),
  });

  const resendMutation = useMutation({
    mutationFn: (id) => enterpriseService.resendEmployeeInvite(id),
    onSuccess: () => {
      toast.success('Đã gửi lại lời mời');
      invalidate();
    },
    onError: (err) => toast.error(err?.message || 'Không thể gửi lại lời mời'),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => enterpriseService.removeEmployee(id),
    onSuccess: () => {
      toast.success('Đã thu hồi lời mời');
      invalidate();
    },
    onError: (err) => toast.error(err?.message || 'Không thể thu hồi lời mời'),
  });

  // ── Shareable multi-use join link ────────────────────────────────────
  const { data: linksData } = useQuery({
    queryKey: ['enterprise', 'invite-links'],
    queryFn: () => enterpriseService.listInviteLinks(),
    enabled: Boolean(isAdmin),
  });
  const links = (() => {
    const raw = unwrap(linksData);
    return Array.isArray(raw) ? raw : raw.links || [];
  })();

  const invalidateLinks = () =>
    queryClient.invalidateQueries({ queryKey: ['enterprise', 'invite-links'] });

  const createLinkMutation = useMutation({
    mutationFn: (payload) => enterpriseService.createInviteLink(payload),
    onSuccess: () => {
      toast.success('Đã tạo link tham gia');
      invalidateLinks();
    },
    onError: (err) => toast.error(err?.message || 'Không thể tạo link'),
  });

  const revokeLinkMutation = useMutation({
    mutationFn: (linkId) => enterpriseService.revokeInviteLink(linkId),
    onSuccess: () => {
      toast.success('Đã thu hồi link');
      invalidateLinks();
    },
    onError: (err) => toast.error(err?.message || 'Không thể thu hồi link'),
  });

  const linkUrl = (token) =>
    `${window.location.origin}/corporate/join/${encodeURIComponent(token)}`;

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        Chỉ Corporate Admin quản lý nhân viên.
      </div>
    );
  }
  if (isLoading) return <Loading />;

  const inviteUrl = inviteToken
    ? `${window.location.origin}/corporate/invite/accept?token=${encodeURIComponent(inviteToken)}`
    : '';

  const closeInvite = () => {
    setInviteOpen(false);
    setInviteToken('');
    setInvite(EMPTY_INVITE);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Nhân viên</h1>
          <p className="text-sm text-ink-400">Mời nhân viên bằng SĐT hoặc email</p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setInviteOpen(true)}>
          Mời nhân viên
        </Button>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <Zap
              className={`mt-0.5 h-5 w-5 ${autoApprove ? 'text-emerald-500' : 'text-ink-300'}`}
            />
            <div>
              <h2 className="text-sm font-semibold text-ink-700">Tự động duyệt chuyến</h2>
              <p className="text-xs text-ink-400">
                {autoApprove
                  ? 'Đang bật: nhân viên đặt xe được duyệt ngay, không cần admin phê duyệt.'
                  : 'Đang tắt: mọi chuyến do nhân viên đặt phải chờ admin phê duyệt.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoApprove}
            disabled={autoApproveMutation.isPending}
            onClick={() => autoApproveMutation.mutate(!autoApprove)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              autoApprove ? 'bg-emerald-500' : 'bg-ink-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                autoApprove ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-brand-primary" />
            <div>
              <h2 className="text-sm font-semibold text-ink-700">Link tham gia dùng chung</h2>
              <p className="text-xs text-ink-400">
                Chia sẻ một link cho nhiều người. Ai chưa có tài khoản sẽ được đưa tới trang đăng
                ký, đăng ký xong vào thẳng cổng doanh nghiệp.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            leftIcon={<Link2 className="h-4 w-4" />}
            loading={createLinkMutation.isPending}
            onClick={() => createLinkMutation.mutate({})}
          >
            Tạo link
          </Button>
        </div>

        {links.length > 0 && (
          <div className="mt-4 space-y-2">
            {links.map((lk) => {
              const url = linkUrl(lk.token);
              const revoked = !lk.isActive;
              const exhausted =
                lk.maxUses != null && lk.usedCount >= lk.maxUses;
              return (
                <div
                  key={lk.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl bg-ink-50 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="break-all font-mono text-xs text-ink-700">{url}</div>
                    <div className="mt-1 text-xs text-ink-400">
                      Đã dùng {lk.usedCount}
                      {lk.maxUses != null ? `/${lk.maxUses}` : ''} lượt
                      {revoked
                        ? ' · Đã thu hồi'
                        : exhausted
                          ? ' · Đã hết lượt'
                          : ' · Đang hoạt động'}
                    </div>
                  </div>
                  {!revoked && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Copy className="h-3.5 w-3.5" />}
                        onClick={async () => {
                          await navigator.clipboard.writeText(url);
                          toast.success('Đã sao chép link');
                        }}
                      >
                        Sao chép
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Ban className="h-3.5 w-3.5" />}
                        loading={
                          revokeLinkMutation.isPending &&
                          revokeLinkMutation.variables === lk.id
                        }
                        onClick={() => revokeLinkMutation.mutate(lk.id)}
                      >
                        Thu hồi
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Chưa có nhân viên" icon={Users} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-50 text-ink-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nhân viên</th>
                <th className="px-4 py-3 font-medium">Mã NV</th>
                <th className="px-4 py-3 font-medium">Phòng ban</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-t border-ink-50">
                  <td className="px-4 py-3 font-medium text-ink-700">
                    <div>{e.user?.fullName || '—'}</div>
                    <div className="text-xs text-ink-300">
                      {e.user?.phone || e.invitedPhone || e.user?.email || e.invitedEmail || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{e.employeeCode || '—'}</td>
                  <td className="px-4 py-3">{e.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {e.isAdmin ? 'Admin' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.isActive ? (
                      <span className="text-emerald-700">Đang hoạt động</span>
                    ) : (
                      <span className="text-amber-700">Chờ nhận lời mời</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!e.isActive && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                          loading={resendMutation.isPending && resendMutation.variables === e.id}
                          onClick={() => resendMutation.mutate(e.id)}
                        >
                          Gửi lại
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          loading={revokeMutation.isPending && revokeMutation.variables === e.id}
                          onClick={() => revokeMutation.mutate(e.id)}
                        >
                          Thu hồi
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={inviteOpen} onClose={closeInvite} title="Mời nhân viên">
        {inviteToken ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              Lời mời đã được gửi qua SMS/email. Bạn cũng có thể chia sẻ link này — người được mời
              cần đăng nhập đúng tài khoản để chấp nhận.
            </p>
            <div className="break-all rounded-xl bg-ink-50 p-3 font-mono text-xs text-ink-700">
              {inviteUrl}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                leftIcon={<Copy className="h-4 w-4" />}
                onClick={async () => {
                  await navigator.clipboard.writeText(inviteUrl);
                  toast.success('Đã sao chép link mời');
                }}
              >
                Sao chép link
              </Button>
              <Button onClick={closeInvite}>Xong</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Số điện thoại"
              value={invite.phone}
              onChange={(e) => setInvite((v) => ({ ...v, phone: e.target.value }))}
              placeholder="Cần số điện thoại hoặc email"
            />
            <Input
              label="Email"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((v) => ({ ...v, email: e.target.value }))}
              placeholder="Cần số điện thoại hoặc email"
            />
            <Input
              label="Phòng ban"
              value={invite.department}
              onChange={(e) => setInvite((v) => ({ ...v, department: e.target.value }))}
            />
            <Input
              label="Mã nhân viên"
              value={invite.employeeCode}
              onChange={(e) => setInvite((v) => ({ ...v, employeeCode: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={invite.isAdmin}
                onChange={(e) => setInvite((v) => ({ ...v, isAdmin: e.target.checked }))}
              />
              Cấp quyền Corporate Admin
            </label>
            <div className="flex gap-3">
              <Button
                loading={inviteMutation.isPending}
                disabled={!invite.phone.trim() && !invite.email.trim()}
                onClick={() => inviteMutation.mutate()}
              >
                Gửi lời mời
              </Button>
              <Button variant="outline" onClick={closeInvite}>
                Huỷ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
