// src/pages/admin/RescueStationListPage.jsx
// Admin rescue station CRUD (Day 37 — UC-31). Search + active filter, table,
// create/edit modal, delete. ADMIN/OPERATOR only.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminRescueStationService } from '../../services/roadsideService.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

const PAGE_SIZE = 20;

const ACTIVE_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã tắt' },
];

const EMPTY = {
  name: '',
  city: '',
  district: '',
  address: '',
  latitude: '',
  longitude: '',
  phone: '',
  hours: '',
  isActive: true,
};

export default function RescueStationListPage() {
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState('');
  const [q, setQ] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null=closed, {}=create, {id}=edit

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['adminRescueStations', isActive, searchTerm, page],
    queryFn: () =>
      adminRescueStationService.list({
        page,
        size: PAGE_SIZE,
        ...(isActive ? { isActive } : {}),
        ...(searchTerm ? { q: searchTerm } : {}),
      }),
    keepPreviousData: true,
  });

  const payload = data?.data ?? data ?? {};
  const list = Array.isArray(payload) ? payload : payload.items || [];
  // paginated() puts the count in `meta`; fall back to legacy shapes then page length.
  const total = data?.meta?.total ?? payload.total ?? data?.total ?? list.length;
  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: EMPTY });

  const saveMutation = useMutation({
    mutationFn: ({ id, body }) =>
      id
        ? adminRescueStationService.update(id, body)
        : adminRescueStationService.create(body),
    onSuccess: (_res, vars) => {
      toast.success(vars.id ? 'Đã cập nhật trạm cứu hộ' : 'Đã tạo trạm cứu hộ');
      queryClient.invalidateQueries({ queryKey: ['adminRescueStations'] });
      closeForm();
    },
    onError: (e) => toast.error(e?.message || 'Lưu trạm cứu hộ thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminRescueStationService.remove(id),
    onSuccess: () => {
      toast.success('Đã xóa trạm cứu hộ');
      queryClient.invalidateQueries({ queryKey: ['adminRescueStations'] });
    },
    onError: (e) => toast.error(e?.message || 'Không thể xóa trạm cứu hộ'),
  });

  const openCreate = () => {
    reset(EMPTY);
    setEditing({});
  };

  const openEdit = (s) => {
    reset({
      name: s.name ?? '',
      city: s.city ?? '',
      district: s.district ?? '',
      address: s.address ?? '',
      latitude: s.latitude ?? '',
      longitude: s.longitude ?? '',
      phone: s.phone ?? '',
      hours: s.hours ?? '',
      isActive: s.isActive ?? true,
    });
    setEditing(s);
  };

  const closeForm = () => setEditing(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(q.trim());
    setPage(1);
  };

  const handleTab = (value) => {
    setIsActive(value);
    setPage(1);
  };

  const handleDelete = (s) => {
    if (window.confirm(`Xóa trạm cứu hộ "${s.name}"?`)) {
      deleteMutation.mutate(s.id);
    }
  };

  const onSubmit = (values) => {
    // latitude/longitude must be numbers; optional strings sent as-is (server
    // normalizes '' → null).
    const body = {
      name: values.name.trim(),
      address: values.address.trim(),
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      city: values.city?.trim() || '',
      district: values.district?.trim() || '',
      phone: values.phone?.trim() || '',
      hours: values.hours?.trim() || '',
      isActive: !!values.isActive,
    };
    saveMutation.mutate({ id: editing?.id, body });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Trạm cứu hộ</h1>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openCreate}
        >
          Thêm trạm
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ACTIVE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTab(tab.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive === tab.value
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-ink-500 ring-1 ring-ink-100 hover:bg-ink-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="w-full sm:w-72">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo tên, thành phố…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : list.length === 0 ? (
          <div className="p-8">
            <EmptyState title="Chưa có trạm cứu hộ" description="Thêm trạm đầu tiên để bắt đầu." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full text-sm ${isFetching ? 'opacity-60' : ''}`}>
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs uppercase text-ink-300">
                  <th className="px-4 py-3 font-medium">Tên trạm</th>
                  <th className="px-4 py-3 font-medium">Khu vực</th>
                  <th className="px-4 py-3 font-medium">Tọa độ</th>
                  <th className="px-4 py-3 font-medium">Điện thoại</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-700">{s.name}</p>
                      <p className="max-w-xs truncate text-xs text-ink-400">{s.address}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {[s.district, s.city].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-ink-400">
                      {Number(s.latitude).toFixed(4)}, {Number(s.longitude).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{s.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.isActive ? 'success' : 'neutral'}>
                        {s.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          title="Sửa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s)}
                          title="Xóa"
                          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger/5 hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={!!editing}
        onClose={closeForm}
        title={editing?.id ? 'Sửa trạm cứu hộ' : 'Thêm trạm cứu hộ'}
        size="2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Tên trạm *"
            placeholder="Trạm cứu hộ Cát Lái"
            error={errors.name?.message}
            {...register('name', {
              required: 'Vui lòng nhập tên trạm',
              minLength: { value: 2, message: 'Tên tối thiểu 2 ký tự' },
            })}
          />

          <Input
            label="Địa chỉ *"
            placeholder="55 Đặng Nhữ Mai, Phường Cát Lái…"
            error={errors.address?.message}
            {...register('address', {
              required: 'Vui lòng nhập địa chỉ',
              minLength: { value: 3, message: 'Địa chỉ tối thiểu 3 ký tự' },
            })}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Thành phố" placeholder="Hồ Chí Minh" {...register('city')} />
            <Input label="Quận / Huyện" placeholder="Thủ Đức" {...register('district')} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Vĩ độ (latitude) *"
                type="number"
                step="any"
                placeholder="10.7769"
                error={errors.latitude?.message}
                {...register('latitude', {
                  required: 'Vui lòng nhập vĩ độ',
                  min: { value: -90, message: 'Vĩ độ trong khoảng -90..90' },
                  max: { value: 90, message: 'Vĩ độ trong khoảng -90..90' },
                })}
              />
            </div>
            <div>
              <Input
                label="Kinh độ (longitude) *"
                type="number"
                step="any"
                placeholder="106.7009"
                error={errors.longitude?.message}
                {...register('longitude', {
                  required: 'Vui lòng nhập kinh độ',
                  min: { value: -180, message: 'Kinh độ trong khoảng -180..180' },
                  max: { value: 180, message: 'Kinh độ trong khoảng -180..180' },
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Điện thoại"
              placeholder="0901234567"
              error={errors.phone?.message}
              {...register('phone', {
                pattern: {
                  value: /^[0-9+\s-]{8,20}$/,
                  message: 'Số điện thoại không hợp lệ',
                },
              })}
            />
            <Input label="Giờ hoạt động" placeholder="24/7" {...register('hours')} />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" className="h-4 w-4 rounded" {...register('isActive')} />
            Đang hoạt động
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeForm}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveMutation.isPending}
              leftIcon={<MapPin className="h-4 w-4" />}
            >
              {editing?.id ? 'Lưu thay đổi' : 'Tạo trạm'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
