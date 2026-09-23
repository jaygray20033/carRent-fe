// src/pages/supplier/MembersPage.jsx — Supplier Admin member/driver management.
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserPlus, Users, Copy, RefreshCw, Trash2, Link2, Ban } from 'lucide-react';
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

  const resendMutation = useMutation({
    mutationFn: (memberId) => supplierPortalService.resendMemberInvite(memberId),
    onSuccess: () => {
      toast.success('Đã gửi lại lời mời');
      queryClient.invalidateQueries({ queryKey: ['supplier', 'members'] });
    },
    onError: (err) => toast.error(err?.message || 'Không thể gửi lại lời mời'),
  });

  const revokeMutation = useMutation({
    mutationFn: (memberId) => supplierPortalService.removeMember(memberId),
    onSuccess: () => {
      toast.success('Đã thu hồi lời mời');
      queryClient.invalidateQueries({ queryKey: ['supplier', 'members'] });
    },
    onError: (err) => toast.error(err?.message || 'Không thể thu hồi lời mời'),
  });

  // ── Shareable multi-use join link ────────────────────────────────────
  const { data: linksData } = useQuery({
    queryKey: ['supplier', 'invite-links'],
    queryFn: () => supplierPortalService.listInviteLinks(),
    enabled: isAdmin,
  });
  const links = (() => {
    const raw = unwrap(linksData);
    return Array.isArray(raw) ? raw : raw.links || [];
  })();

  const invalidateLinks = () =>
    queryClient.invalidateQueries({ queryKey: ['supplier', 'invite-links'] });

  const createLinkMutation = useMutation({
    mutationFn: (payload) => supplierPortalService.createInviteLink(payload),
    onSuccess: () => {
      toast.success('Đã tạo link tham gia');
      invalidateLinks();
    },
    onError: (err) => toast.error(err?.message || 'Không thể tạo link'),
  });

  const revokeLinkMutation = useMutation({
    mutationFn: (linkId) => supplierPortalService.revokeInviteLink(linkId),
    onSuccess: () => {
      toast.success('Đã thu hồi link');
      invalidateLinks();
    },
    onError: (err) => toast.error(err?.message || 'Không thể thu hồi link'),
  });

  const linkUrl = (token) =>
    `${window.location.origin}/supplier/join/${encodeURIComponent(token)}`;

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

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-brand-primary" />
            <div>
              <h2 className="text-sm font-semibold text-ink-700">Link tham gia dùng chung</h2>
              <p className="text-xs text-ink-400">
                Chia sẻ một link cho nhiều tài xế. Ai chưa có tài khoản sẽ được đưa tới trang đăng
                ký, đăng ký xong vào thẳng cổng nhà cung cấp. Tên, số điện thoại và email của tài
                xế sẽ được lưu khi họ tham gia.
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
              const exhausted = lk.maxUses != null && lk.usedCount >= lk.maxUses;
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
                          revokeLinkMutation.isPending && revokeLinkMutation.variables === lk.id
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
                    {m.isActive ? (
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
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                          loading={resendMutation.isPending && resendMutation.variables === m.id}
                          onClick={() => resendMutation.mutate(m.id)}
                        >
                          Gửi lại
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                          loading={revokeMutation.isPending && revokeMutation.variables === m.id}
                          onClick={() => revokeMutation.mutate(m.id)}
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
