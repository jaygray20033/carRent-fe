// src/pages/supplier/MembersPage.jsx — Supplier Admin member/driver management.
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus, Users, Copy } from 'lucide-react';
import { supplierPortalService } from '../../services/supplierService.js';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

export default function SupplierMembersPage() {
  const { isAdmin } = useOutletContext() || {};
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ fullName: '', phone: '', email: '', isAdmin: false });
  const [inviteToken, setInviteToken] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', 'members'],
    queryFn: () => supplierPortalService.listMembers(),
    enabled: isAdmin,
  });

  const payload = unwrap(data);
  const members = Array.isArray(payload) ? payload : payload.items || [];

  const inviteMutation = useMutation({
    mutationFn: () =>
      supplierPortalService.inviteMember({
        fullName: invite.fullName || undefined,
        phone: invite.phone || undefined,
        email: invite.email || undefined,
        isAdmin: invite.isAdmin,
      }),
    onSuccess: (res) => {
      const result = unwrap(res);
      setInviteToken(result.inviteToken || '');
      toast.success('Đã tạo lời mời');
      queryClient.invalidateQueries({ queryKey: ['supplier', 'members'] });
    },
    onError: (err) => toast.error(err?.message || 'Không thể tạo lời mời'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ memberId, payload: patch }) =>
      supplierPortalService.updateMember(memberId, patch),
    onSuccess: () => {
      toast.success('Đã cập nhật thành viên');
      queryClient.invalidateQueries({ queryKey: ['supplier', 'members'] });
    },
    onError: (err) => toast.error(err?.message || 'Không thể cập nhật thành viên'),
  });

  if (!isAdmin) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-ink-500 shadow-sm ring-1 ring-ink-100">
        Chỉ Supplier Admin được quản lý thành viên.
      </div>
    );
  }
  if (isLoading) return <Loading />;

  const inviteUrl = inviteToken
    ? `${window.location.origin}/supplier/invite/accept?token=${encodeURIComponent(inviteToken)}`
    : '';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Tài xế & thành viên</h1>
          <p className="text-sm text-ink-400">Mời tài xế hoặc thêm Supplier Admin</p>
        </div>
        <Button leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => setInviteOpen(true)}>
          Mời thành viên
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState title="Chưa có thành viên" icon={Users} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Thành viên</th>
                <th className="px-4 py-3 font-medium">Liên hệ</th>
                <th className="px-4 py-3 font-medium">Vai trò</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-ink-50">
                  <td className="px-4 py-3 font-medium text-ink-700">
                    {m.fullName || m.user?.fullName || '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-500">
                    <div>{m.user?.phone || m.invitedPhone || '—'}</div>
                    <div className="text-xs text-ink-300">
                      {m.user?.email || m.invitedEmail || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.isAdmin
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {m.isAdmin ? 'Supplier Admin' : 'Tài xế'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.isActive ? (
                      <span className="text-emerald-700">Đang hoạt động</span>
                    ) : (
                      <span className="text-amber-700">Chờ nhận lời mời</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.isActive && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            memberId: m.id,
                            payload: { isAdmin: !m.isAdmin },
                          })
                        }
                      >
                        {m.isAdmin ? 'Đổi thành tài xế' : 'Cấp quyền Admin'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteToken('');
        }}
        title="Mời thành viên"
      >
        {inviteToken ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">
              Gửi link này cho thành viên. Họ cần đăng nhập đúng tài khoản được mời để chấp nhận.
            </p>
            <div className="break-all rounded-xl bg-ink-50 p-3 font-mono text-xs text-ink-700">
              {inviteUrl}
            </div>
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
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="Họ tên"
              value={invite.fullName}
              onChange={(e) => setInvite((v) => ({ ...v, fullName: e.target.value }))}
            />
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
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={invite.isAdmin}
                onChange={(e) => setInvite((v) => ({ ...v, isAdmin: e.target.checked }))}
              />
              Cấp quyền Supplier Admin
            </label>
            <div className="flex gap-3">
              <Button
                loading={inviteMutation.isPending}
                disabled={!invite.phone.trim() && !invite.email.trim()}
                onClick={() => inviteMutation.mutate()}
              >
                Tạo lời mời
              </Button>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                Huỷ
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
