// src/pages/admin/suppliers/SupplierListPage.jsx — OtoRent supplier registry.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Building2, Eye, Plus, Search } from 'lucide-react';
import { adminSupplierService } from '../../../services/supplierService.js';
import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Button from '../../../components/ui/Button.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import Loading from '../../../components/common/Loading.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;
const unwrap = (res) => res?.data ?? res ?? {};
const listOf = (res) => {
  const p = unwrap(res);
  return Array.isArray(p) ? p : p.items || [];
};

const initialForm = {
  name: '',
  taxCode: '',
  address: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  commissionRate: '0.15',
  contractRef: '',
  transportLicenseNo: '',
};

export default function SupplierListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'suppliers', searchTerm, activeFilter, page],
    queryFn: () =>
      adminSupplierService.list({
        page,
        size: PAGE_SIZE,
        ...(searchTerm ? { q: searchTerm } : {}),
        ...(activeFilter ? { isActive: activeFilter } : {}),
      }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminSupplierService.create({
        ...form,
        commissionRate: Number(form.commissionRate),
        taxCode: form.taxCode || null,
        contactEmail: form.contactEmail || null,
      }),
    onSuccess: (res) => {
      const supplier = unwrap(res)?.supplier || unwrap(res);
      toast.success('Đã tạo nhà cung cấp');
      setCreateOpen(false);
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ['admin', 'suppliers'] });
      if (supplier?.id) navigate(`/admin/suppliers/${supplier.id}`);
    },
    onError: (err) => toast.error(err?.message || 'Không thể tạo nhà cung cấp'),
  });

  const list = listOf(data);
  const meta = data?.meta ?? {};
  const total = meta.total ?? list.length;
  const totalPages = meta.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-700">Nhà cung cấp</h1>
          <p className="text-sm text-ink-400">
            Đối tác vận tải, thành viên, commission và payout
          </p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Thêm nhà cung cấp
        </Button>
      </div>

      <form
        className="grid gap-3 sm:grid-cols-[1fr_220px]"
        onSubmit={(event) => {
          event.preventDefault();
          setSearchTerm(q.trim());
          setPage(1);
        }}
      >
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Tìm tên / MST / hợp đồng / liên hệ…"
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'true', label: 'Đang hoạt động' },
            { value: 'false', label: 'Đã tạm ngưng' },
          ]}
        />
      </form>

      {isLoading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState title="Chưa có nhà cung cấp" icon={Building2} />
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nhà cung cấp</th>
                <th className="px-4 py-3 font-medium">MST / Hợp đồng</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Thành viên</th>
                <th className="px-4 py-3 font-medium">Chuyến</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {list.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="cursor-pointer border-t border-ink-50 hover:bg-ink-50/60"
                  onClick={() => navigate(`/admin/suppliers/${supplier.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink-700">{supplier.name}</div>
                    <div className="text-xs text-ink-300">
                      {supplier.contactName || '—'} · {supplier.contactPhone || ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs">{supplier.taxCode || '—'}</div>
                    <div className="text-xs text-ink-300">{supplier.contractRef || 'Chưa có HĐ'}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(Number(supplier.commissionRate || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">{supplier._count?.members ?? 0}</td>
                  <td className="px-4 py-3">{supplier._count?.bookings ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        supplier.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {supplier.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Eye className="inline h-4 w-4 text-ink-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Thêm nhà cung cấp" size="2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Tên nhà cung cấp *"
            value={form.name}
            onChange={(event) => updateForm('name', event.target.value)}
          />
          <Input
            label="Mã số thuế"
            value={form.taxCode}
            onChange={(event) => updateForm('taxCode', event.target.value)}
          />
          <Input
            label="Người liên hệ"
            value={form.contactName}
            onChange={(event) => updateForm('contactName', event.target.value)}
          />
          <Input
            label="Số điện thoại"
            value={form.contactPhone}
            onChange={(event) => updateForm('contactPhone', event.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={form.contactEmail}
            onChange={(event) => updateForm('contactEmail', event.target.value)}
          />
          <Input
            label="Commission (0–1)"
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={form.commissionRate}
            onChange={(event) => updateForm('commissionRate', event.target.value)}
            helperText="VD: 0.15 = 15%"
          />
          <Input
            label="Mã hợp đồng"
            value={form.contractRef}
            onChange={(event) => updateForm('contractRef', event.target.value)}
          />
          <Input
            label="Giấy phép vận tải"
            value={form.transportLicenseNo}
            onChange={(event) => updateForm('transportLicenseNo', event.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Địa chỉ"
              value={form.address}
              onChange={(event) => updateForm('address', event.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            loading={createMutation.isPending}
            disabled={!form.name.trim()}
            onClick={() => createMutation.mutate()}
          >
            Tạo nhà cung cấp
          </Button>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Huỷ
          </Button>
        </div>
      </Modal>
    </div>
  );
}
