import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Copy,
  Download,
  Pencil,
  Plus,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import {
  adminSupplierService,
  SETTLEMENT_STATUS_BADGE,
  SETTLEMENT_STATUS_LABEL,
} from '../../../services/supplierService.js';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/format.js';
import Button from '../../../components/ui/Button.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Input from '../../../components/ui/Input.jsx';
import Loading from '../../../components/common/Loading.jsx';
import Modal from '../../../components/ui/Modal.jsx';

const unwrap = (response) => response?.data ?? response ?? {};
const listOf = (response) => {
  const payload = unwrap(response);
  return Array.isArray(payload) ? payload : payload.items || [];
};

const emptyEditForm = {
  name: '',
  taxCode: '',
  address: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  commissionRate: '0.15',
  contractRef: '',
  contractStart: '',
  contractEnd: '',
  transportLicenseNo: '',
  note: '',
};

const emptyInviteForm = {
  fullName: '',
  phone: '',
  email: '',
  isAdmin: false,
};

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [inviteToken, setInviteToken] = useState('');
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ periodStart: '', periodEnd: '', note: '' });
  const [selectedSettlementId, setSelectedSettlementId] = useState(null);
  const [settlementAction, setSettlementAction] = useState('');
  const [actionValue, setActionValue] = useState('');

  const { data: supplierResponse, isLoading } = useQuery({
    queryKey: ['admin', 'supplier', id],
    queryFn: () => adminSupplierService.get(id),
    enabled: Boolean(id),
  });
  const { data: settlementResponse } = useQuery({
    queryKey: ['admin', 'supplier', id, 'settlements'],
    queryFn: () => adminSupplierService.listSettlements(id, { size: 100 }),
    enabled: Boolean(id),
  });
  const { data: commissionResponse } = useQuery({
    queryKey: ['admin', 'supplier', id, 'commission'],
    queryFn: () => adminSupplierService.commissionReport(id),
    enabled: Boolean(id),
  });
  const { data: settlementDetailResponse, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'supplier', id, 'settlement', selectedSettlementId],
    queryFn: () => adminSupplierService.getSettlement(id, selectedSettlementId),
    enabled: Boolean(id && selectedSettlementId),
  });

  const supplier = unwrap(supplierResponse)?.supplier || unwrap(supplierResponse);
  const settlements = listOf(settlementResponse);
  const report = unwrap(commissionResponse)?.report || unwrap(commissionResponse);
  const selectedSettlement =
    unwrap(settlementDetailResponse)?.settlement || unwrap(settlementDetailResponse);

  const openEditModal = () => {
    if (!supplier?.id) return;
    setEditForm({
      name: supplier.name || '',
      taxCode: supplier.taxCode || '',
      address: supplier.address || '',
      contactName: supplier.contactName || '',
      contactPhone: supplier.contactPhone || '',
      contactEmail: supplier.contactEmail || '',
      commissionRate: String(supplier.commissionRate ?? 0.15),
      contractRef: supplier.contractRef || '',
      contractStart: supplier.contractStart?.slice(0, 10) || '',
      contractEnd: supplier.contractEnd?.slice(0, 10) || '',
      transportLicenseNo: supplier.transportLicenseNo || '',
      note: supplier.note || '',
    });
    setEditOpen(true);
  };

  const invalidateSupplier = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'supplier', id] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
  };

  const invalidateSettlement = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'supplier', id, 'settlements'] });
    queryClient.invalidateQueries({
      queryKey: ['admin', 'supplier', id, 'settlement', selectedSettlementId],
    });
    queryClient.invalidateQueries({ queryKey: ['admin', 'supplier', id, 'commission'] });
  };

  const updateMutation = useMutation({
    mutationFn: (payload) => adminSupplierService.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật nhà cung cấp');
      setEditOpen(false);
      invalidateSupplier();
    },
    onError: (error) => toast.error(error?.message || 'Không thể cập nhật nhà cung cấp'),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => adminSupplierService.deactivate(id),
    onSuccess: () => {
      toast.success('Đã tạm ngưng nhà cung cấp');
      invalidateSupplier();
    },
    onError: (error) => toast.error(error?.message || 'Không thể tạm ngưng nhà cung cấp'),
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      adminSupplierService.inviteMember(id, {
        fullName: inviteForm.fullName || undefined,
        phone: inviteForm.phone || undefined,
        email: inviteForm.email || undefined,
        isAdmin: inviteForm.isAdmin,
      }),
    onSuccess: (response) => {
      setInviteToken(unwrap(response)?.inviteToken || '');
      toast.success('Đã tạo lời mời');
      invalidateSupplier();
    },
    onError: (error) => toast.error(error?.message || 'Không thể tạo lời mời'),
  });

  const memberMutation = useMutation({
    mutationFn: ({ memberId, payload }) =>
      adminSupplierService.updateMember(id, memberId, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật thành viên');
      invalidateSupplier();
    },
    onError: (error) => toast.error(error?.message || 'Không thể cập nhật thành viên'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => adminSupplierService.removeMember(id, memberId),
    onSuccess: () => {
      toast.success('Đã xoá thành viên');
      invalidateSupplier();
    },
    onError: (error) => toast.error(error?.message || 'Không thể xoá thành viên'),
  });

  const createPayoutMutation = useMutation({
    mutationFn: () => adminSupplierService.createSettlement(id, payoutForm),
    onSuccess: () => {
      toast.success('Đã tạo kỳ payout');
      setPayoutOpen(false);
      setPayoutForm({ periodStart: '', periodEnd: '', note: '' });
      invalidateSettlement();
    },
    onError: (error) => toast.error(error?.message || 'Không thể tạo kỳ payout'),
  });

  const settlementMutation = useMutation({
    mutationFn: ({ action, value }) => {
      if (action === 'verify') {
        return adminSupplierService.verifySettlement(id, selectedSettlementId);
      }
      if (action === 'reject') {
        return adminSupplierService.rejectSettlement(id, selectedSettlementId, { reason: value });
      }
      return adminSupplierService.markSettlementPaid(id, selectedSettlementId, {
        paymentReference: value,
      });
    },
    onSuccess: (_, variables) => {
      const message = {
        verify: 'Đã xác minh hồ sơ payout',
        reject: 'Đã yêu cầu nhà cung cấp bổ sung hồ sơ',
        paid: 'Đã đánh dấu thanh toán',
      }[variables.action];
      toast.success(message);
      setSettlementAction('');
      setActionValue('');
      invalidateSettlement();
    },
    onError: (error) => toast.error(error?.message || 'Không thể cập nhật kỳ payout'),
  });

  const downloadDispatchRecord = async (item, format) => {
    try {
      const blob = await adminSupplierService.dispatchRecord(item.bookingId, format);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${item.dispatchRecordCode}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.message || `Không thể tải LDX ${format.toUpperCase()}`);
    }
  };

  if (isLoading) return <Loading />;
  if (!supplier?.id) return <EmptyState title="Không tìm thấy nhà cung cấp" />;

  const inviteUrl = inviteToken
    ? `${window.location.origin}/supplier/invite/accept?token=${encodeURIComponent(inviteToken)}`
    : '';

  const submitEdit = () => {
    updateMutation.mutate({
      ...editForm,
      commissionRate: Number(editForm.commissionRate),
      taxCode: editForm.taxCode || null,
      contactEmail: editForm.contactEmail || null,
      contractStart: editForm.contractStart || null,
      contractEnd: editForm.contractEnd || null,
    });
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/suppliers')}
        className="inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Danh sách nhà cung cấp
      </button>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink-700">{supplier.name}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  supplier.isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-ink-100 text-ink-500'
                }`}
              >
                {supplier.isActive ? 'Hoạt động' : 'Tạm ngưng'}
              </span>
            </div>
            <p className="mt-1 text-sm text-ink-400">
              MST: {supplier.taxCode || '—'} · HĐ: {supplier.contractRef || '—'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={openEditModal}
            >
              Chỉnh sửa
            </Button>
            {supplier.isActive ? (
              <Button
                variant="danger"
                loading={deactivateMutation.isPending}
                onClick={() => {
                  if (window.confirm('Tạm ngưng nhà cung cấp này?')) {
                    deactivateMutation.mutate();
                  }
                }}
              >
                Tạm ngưng
              </Button>
            ) : (
              <Button onClick={() => updateMutation.mutate({ isActive: true })}>Kích hoạt</Button>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Người liên hệ" value={supplier.contactName} />
          <Info label="Điện thoại" value={supplier.contactPhone} />
          <Info label="Email" value={supplier.contactEmail} />
          <Info label="Địa chỉ" value={supplier.address} />
          <Info label="Giấy phép vận tải" value={supplier.transportLicenseNo} />
          <Info
            label="Commission mặc định"
            value={`${(Number(supplier.commissionRate || 0) * 100).toFixed(1)}%`}
          />
          <Info
            label="Thời hạn hợp đồng"
            value={`${formatDate(supplier.contractStart)} → ${formatDate(supplier.contractEnd)}`}
          />
          <Info label="Vi phạm CRITICAL" value={supplier.criticalViolationCount ?? 0} />
          <Info label="Rủi ro chấm dứt HĐ" value={supplier.terminationRisk ? 'Có' : 'Không'} />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink-700">Thành viên ({supplier.members?.length || 0})</h2>
            <p className="text-xs text-ink-400">Supplier Admin và tài xế nhận chuyến</p>
          </div>
          <Button
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setInviteOpen(true)}
          >
            Mời thành viên
          </Button>
        </div>
        {!supplier.members?.length ? (
          <EmptyState title="Chưa có thành viên" icon={Users} className="py-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-ink-400">
                <tr>
                  <th className="pb-2 font-medium">Thành viên</th>
                  <th className="pb-2 font-medium">Liên hệ</th>
                  <th className="pb-2 font-medium">Vai trò</th>
                  <th className="pb-2 font-medium">Trạng thái</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {supplier.members.map((member) => (
                  <tr key={member.id} className="border-t border-ink-50">
                    <td className="py-3 font-medium text-ink-700">
                      {member.fullName || member.user?.fullName || '—'}
                    </td>
                    <td className="py-3 text-ink-500">
                      <div>{member.user?.phone || member.invitedPhone || '—'}</div>
                      <div className="text-xs text-ink-300">
                        {member.user?.email || member.invitedEmail || ''}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-ink-600">
                        {member.isAdmin ? 'Supplier Admin' : 'Tài xế'}
                      </span>
                    </td>
                    <td className="py-3">
                      {member.isActive ? (
                        <span className="text-emerald-700">Hoạt động</span>
                      ) : (
                        <span className="text-amber-700">Chờ nhận lời mời</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {member.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              memberMutation.mutate({
                                memberId: member.id,
                                payload: { isAdmin: !member.isAdmin },
                              })
                            }
                          >
                            {member.isAdmin ? 'Đổi thành tài xế' : 'Cấp Admin'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm('Xoá thành viên khỏi nhà cung cấp?')) {
                              removeMemberMutation.mutate(member.id);
                            }
                          }}
                        >
                          Xoá
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink-700">Payout cho nhà cung cấp</h2>
            <p className="text-xs text-ink-400">
              Thực nhận = tổng finalAmount − commission OtoRent
            </p>
          </div>
          <Button
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setPayoutOpen(true)}
          >
            Tạo kỳ payout
          </Button>
        </div>

        {!settlements.length ? (
          <EmptyState title="Chưa có kỳ payout" icon={Wallet} className="py-8" />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-ink-400">
                <tr>
                  <th className="pb-2 font-medium">Kỳ</th>
                  <th className="pb-2 font-medium">Chuyến</th>
                  <th className="pb-2 font-medium">Tổng chuyến</th>
                  <th className="pb-2 font-medium">Commission</th>
                  <th className="pb-2 font-medium">Thực nhận</th>
                  <th className="pb-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => (
                  <tr
                    key={settlement.id}
                    className="cursor-pointer border-t border-ink-50 hover:bg-ink-50/60"
                    onClick={() => {
                      setSelectedSettlementId(settlement.id);
                      setSettlementAction('');
                    }}
                  >
                    <td className="py-3 font-medium text-brand-primary">
                      {formatDate(settlement.periodStart)} → {formatDate(settlement.periodEnd)}
                    </td>
                    <td className="py-3">{settlement._count?.bookings ?? '—'}</td>
                    <td className="py-3">{formatCurrency(settlement.totalFinalAmount)}</td>
                    <td className="py-3">{formatCurrency(settlement.totalCommissionAmount)}</td>
                    <td className="py-3 font-semibold">{formatCurrency(settlement.supplierPayout)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          SETTLEMENT_STATUS_BADGE[settlement.status] ||
                          'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {SETTLEMENT_STATUS_LABEL[settlement.status] || settlement.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100">
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <Summary label="Chuyến SETTLED" value={report.bookingCount ?? 0} />
          <Summary label="Tổng finalAmount" value={formatCurrency(report.totalFinalAmount)} />
          <Summary label="Commission" value={formatCurrency(report.totalCommission)} />
          <Summary label="Supplier payout" value={formatCurrency(report.totalSupplierPayout)} />
        </div>
        <h2 className="mb-3 font-semibold text-ink-700">Báo cáo commission & LDX</h2>
        {!report.items?.length ? (
          <p className="text-sm text-ink-300">Chưa có chuyến SETTLED</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-ink-400">
                <tr>
                  <th className="pb-2 font-medium">LDX</th>
                  <th className="pb-2 font-medium">Hoàn thành</th>
                  <th className="pb-2 font-medium">Final</th>
                  <th className="pb-2 font-medium">Commission</th>
                  <th className="pb-2 font-medium">Payout</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {report.items.map((item) => (
                  <tr key={item.bookingId} className="border-t border-ink-50">
                    <td className="py-3 font-mono text-xs">{item.dispatchRecordCode}</td>
                    <td className="py-3">{formatDateTime(item.completedAt)}</td>
                    <td className="py-3">{formatCurrency(item.finalAmount)}</td>
                    <td className="py-3">{formatCurrency(item.commissionAmount)}</td>
                    <td className="py-3 font-medium">{formatCurrency(item.supplierPayout)}</td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Download className="h-3.5 w-3.5" />}
                          onClick={() => downloadDispatchRecord(item, 'pdf')}
                        >
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Download className="h-3.5 w-3.5" />}
                          onClick={() => downloadDispatchRecord(item, 'csv')}
                        >
                          CSV
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Chỉnh sửa nhà cung cấp" size="2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <EditInput label="Tên nhà cung cấp *" field="name" form={editForm} setForm={setEditForm} />
          <EditInput label="Mã số thuế" field="taxCode" form={editForm} setForm={setEditForm} />
          <EditInput label="Người liên hệ" field="contactName" form={editForm} setForm={setEditForm} />
          <EditInput label="Điện thoại" field="contactPhone" form={editForm} setForm={setEditForm} />
          <EditInput label="Email" field="contactEmail" type="email" form={editForm} setForm={setEditForm} />
          <EditInput
            label="Commission (0–1)"
            field="commissionRate"
            type="number"
            min="0"
            max="1"
            step="0.01"
            form={editForm}
            setForm={setEditForm}
          />
          <EditInput label="Mã hợp đồng" field="contractRef" form={editForm} setForm={setEditForm} />
          <EditInput
            label="Giấy phép vận tải"
            field="transportLicenseNo"
            form={editForm}
            setForm={setEditForm}
          />
          <EditInput label="Ngày bắt đầu HĐ" field="contractStart" type="date" form={editForm} setForm={setEditForm} />
          <EditInput label="Ngày kết thúc HĐ" field="contractEnd" type="date" form={editForm} setForm={setEditForm} />
          <div className="sm:col-span-2">
            <EditInput label="Địa chỉ" field="address" form={editForm} setForm={setEditForm} />
          </div>
          <div className="sm:col-span-2">
            <EditInput label="Ghi chú" field="note" form={editForm} setForm={setEditForm} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button loading={updateMutation.isPending} disabled={!editForm.name.trim()} onClick={submitEdit}>
            Lưu thay đổi
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(false)}>Huỷ</Button>
        </div>
      </Modal>

      <Modal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteToken('');
          setInviteForm(emptyInviteForm);
        }}
        title="Mời thành viên"
      >
        {inviteToken ? (
          <div className="space-y-4">
            <p className="text-sm text-ink-500">Gửi link này cho tài khoản được mời:</p>
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
            <Input label="Họ tên" value={inviteForm.fullName} onChange={(event) => setInviteForm((value) => ({ ...value, fullName: event.target.value }))} />
            <Input label="Số điện thoại" value={inviteForm.phone} onChange={(event) => setInviteForm((value) => ({ ...value, phone: event.target.value }))} />
            <Input label="Email" type="email" value={inviteForm.email} onChange={(event) => setInviteForm((value) => ({ ...value, email: event.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={inviteForm.isAdmin} onChange={(event) => setInviteForm((value) => ({ ...value, isAdmin: event.target.checked }))} />
              Cấp quyền Supplier Admin
            </label>
            <div className="flex gap-3">
              <Button loading={inviteMutation.isPending} disabled={!inviteForm.phone.trim() && !inviteForm.email.trim()} onClick={() => inviteMutation.mutate()}>
                Tạo lời mời
              </Button>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Huỷ</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={payoutOpen} onClose={() => setPayoutOpen(false)} title="Tạo kỳ payout">
        <div className="space-y-4">
          <Input label="Từ ngày *" type="date" value={payoutForm.periodStart} onChange={(event) => setPayoutForm((value) => ({ ...value, periodStart: event.target.value }))} />
          <Input label="Đến ngày *" type="date" value={payoutForm.periodEnd} onChange={(event) => setPayoutForm((value) => ({ ...value, periodEnd: event.target.value }))} />
          <Input label="Ghi chú" value={payoutForm.note} onChange={(event) => setPayoutForm((value) => ({ ...value, note: event.target.value }))} />
          <p className="text-xs text-ink-400">
            Hệ thống tự gom chuyến SETTLED chưa thuộc kỳ payout, theo completedAt trong khoảng ngày đã chọn.
          </p>
          <div className="flex gap-3">
            <Button loading={createPayoutMutation.isPending} disabled={!payoutForm.periodStart || !payoutForm.periodEnd} onClick={() => createPayoutMutation.mutate()}>
              Tạo kỳ
            </Button>
            <Button variant="outline" onClick={() => setPayoutOpen(false)}>Huỷ</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(selectedSettlementId)}
        onClose={() => {
          setSelectedSettlementId(null);
          setSettlementAction('');
          setActionValue('');
        }}
        title={`Chi tiết payout #${selectedSettlementId || ''}`}
        size="2xl"
      >
        {detailLoading || !selectedSettlement?.id ? (
          <Loading />
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-ink-700">
                  {formatDate(selectedSettlement.periodStart)} → {formatDate(selectedSettlement.periodEnd)}
                </div>
                <div className="text-sm text-ink-400">
                  Payout: {formatCurrency(selectedSettlement.supplierPayout)}
                </div>
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${SETTLEMENT_STATUS_BADGE[selectedSettlement.status] || 'bg-ink-100 text-ink-500'}`}>
                {SETTLEMENT_STATUS_LABEL[selectedSettlement.status] || selectedSettlement.status}
              </span>
            </div>

            {selectedSettlement.rejectionReason && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                Lý do từ chối: {selectedSettlement.rejectionReason}
              </div>
            )}

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Số hoá đơn GTGT" value={selectedSettlement.vatInvoiceRef} />
              <DocumentLink label="Hoá đơn GTGT" url={selectedSettlement.vatInvoiceUrl} />
              <DocumentLink label="Bảng kê" url={selectedSettlement.statementUrl} />
              <DocumentLink label="Tập LDX" url={selectedSettlement.dispatchRecordsUrl} />
              <DocumentLink label="Chứng từ khác" url={selectedSettlement.supportingDocumentsUrl} />
              <Info label="Mã thanh toán" value={selectedSettlement.paymentReference} />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink-700">
                Chuyến trong kỳ ({selectedSettlement.bookings?.length || 0})
              </h3>
              <div className="max-h-56 overflow-auto rounded-xl bg-ink-50 px-3">
                {selectedSettlement.bookings?.map((booking) => (
                  <div key={booking.id} className="flex flex-wrap justify-between gap-2 border-b border-ink-100 py-2 text-sm last:border-0">
                    <span>#{booking.id} · {booking.pickupAddress} → {booking.dropoffAddress}</span>
                    <span className="font-medium">{formatCurrency(booking.finalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedSettlement.status === 'DOCUMENTS_SUBMITTED' && (
                <>
                  <Button loading={settlementMutation.isPending && settlementAction === 'verify'} onClick={() => {
                    setSettlementAction('verify');
                    settlementMutation.mutate({ action: 'verify', value: '' });
                  }}>
                    Xác minh hồ sơ
                  </Button>
                  <Button variant="danger" onClick={() => {
                    setSettlementAction('reject');
                    setActionValue('');
                  }}>
                    Yêu cầu bổ sung
                  </Button>
                </>
              )}
              {selectedSettlement.status === 'VERIFIED' && (
                <Button onClick={() => {
                  setSettlementAction('paid');
                  setActionValue('');
                }}>
                  Đánh dấu đã thanh toán
                </Button>
              )}
            </div>

            {settlementAction === 'reject' && (
              <ActionForm
                label="Lý do yêu cầu bổ sung *"
                value={actionValue}
                setValue={setActionValue}
                loading={settlementMutation.isPending}
                buttonLabel="Gửi yêu cầu bổ sung"
                variant="danger"
                onSubmit={() => settlementMutation.mutate({ action: 'reject', value: actionValue })}
              />
            )}
            {settlementAction === 'paid' && (
              <ActionForm
                label="Mã giao dịch thanh toán *"
                value={actionValue}
                setValue={setActionValue}
                loading={settlementMutation.isPending}
                buttonLabel="Xác nhận đã thanh toán"
                onSubmit={() => settlementMutation.mutate({ action: 'paid', value: actionValue })}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-400">{label}</div>
      <div className="font-medium text-ink-700">{value || '—'}</div>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-xl bg-ink-50 p-3">
      <div className="text-xs text-ink-400">{label}</div>
      <div className="font-semibold text-ink-700">{value}</div>
    </div>
  );
}

function EditInput({ field, form, setForm, ...props }) {
  return (
    <Input
      {...props}
      value={form[field]}
      onChange={(event) => setForm((value) => ({ ...value, [field]: event.target.value }))}
    />
  );
}

function DocumentLink({ label, url }) {
  return (
    <div>
      <div className="text-xs text-ink-400">{label}</div>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="font-medium text-brand-primary underline">
          Mở tài liệu
        </a>
      ) : (
        <span className="text-ink-300">—</span>
      )}
    </div>
  );
}

function ActionForm({ label, value, setValue, loading, buttonLabel, onSubmit, variant = 'primary' }) {
  return (
    <div className="space-y-3 rounded-xl bg-ink-50 p-4">
      <Input label={label} value={value} onChange={(event) => setValue(event.target.value)} />
      <Button variant={variant} loading={loading} disabled={!value.trim()} onClick={onSubmit}>
        {buttonLabel}
      </Button>
    </div>
  );
}
