// src/pages/user/AddressBookPage.jsx
// UC-42 (CRUD) + UC-43 (set default) — "Địa chỉ của tôi".
// Figma: UserAccount-Address.png — list of address cards with a map thumbnail,
// a "Thêm địa chỉ" action, and a per-card menu (edit / set default / delete).
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin, MoreVertical, Pencil, Trash2, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { addressService } from '../../services/addressService.js';
import Loading from '../../components/common/Loading.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';

const EMPTY_FORM = {
  contactName: '',
  contactPhone: '',
  line: '',
  ward: '',
  district: '',
  city: '',
  postalCode: '',
  isDefault: false,
};

// Static map thumbnail (no API key needed) centred on the address text.
const mapThumb = (addr) => {
  const q = encodeURIComponent(
    [addr.line, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')
  );
  return `https://maps.googleapis.com/maps/api/staticmap?center=${q}&zoom=14&size=120x80`;
};

function AddressCard({ addr, onEdit, onDelete, onSetDefault }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative flex items-start justify-between gap-4 border-b border-ink-100 py-5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="font-semibold text-ink-900">{addr.line}</p>
          {addr.isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-brand-primary">
              <Star className="h-3 w-3 fill-current" /> Mặc định
            </span>
          )}
        </div>
        <p className="text-sm text-ink-500">
          {[addr.ward, addr.district, addr.city].filter(Boolean).join(' - ')}
        </p>
        {addr.postalCode && (
          <p className="mt-1 text-sm text-ink-400">Mã bưu chính : {addr.postalCode}</p>
        )}
        <p className="text-sm text-ink-400">Số điện thoại di động : {addr.contactPhone}</p>
        <p className="text-sm text-ink-400">Tên : {addr.contactName}</p>
      </div>

      <img
        src={mapThumb(addr)}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        className="hidden h-20 w-28 shrink-0 rounded-lg object-cover ring-1 ring-ink-100 sm:block"
      />

      {/* Per-card menu */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
          className="rounded-lg p-2 text-ink-300 transition-colors hover:bg-ink-50 hover:text-ink-700"
          title="Tùy chọn"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-card ring-1 ring-ink-100">
            <button
              type="button"
              onClick={() => onEdit(addr)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
            >
              <Pencil className="h-4 w-4" /> Chỉnh sửa
            </button>
            {!addr.isDefault && (
              <button
                type="button"
                onClick={() => onSetDefault(addr)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-ink-50"
              >
                <Check className="h-4 w-4" /> Đặt làm mặc định
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(addr)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-4 w-4" /> Xóa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddressBookPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.list(),
  });
  const addresses = data?.data?.addresses ?? [];

  // Form modal: null | { mode: 'create' } | { mode: 'edit', id }
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] });

  const saveMutation = useMutation({
    mutationFn: ({ mode, id, payload }) =>
      mode === 'edit' ? addressService.update(id, payload) : addressService.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success('Đã lưu địa chỉ');
      setModal(null);
    },
    onError: (e) => toast.error(e?.message || 'Lưu địa chỉ thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => addressService.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success('Đã xóa địa chỉ');
      setDeleting(null);
    },
    onError: (e) => toast.error(e?.message || 'Xóa địa chỉ thất bại'),
  });

  const defaultMutation = useMutation({
    mutationFn: (id) => addressService.setDefault(id),
    onSuccess: () => {
      invalidate();
      toast.success('Đã đặt địa chỉ mặc định');
    },
    onError: (e) => toast.error(e?.message || 'Thao tác thất bại'),
  });

  if (isLoading) return <Loading />;

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: 'create' });
  };

  const openEdit = (addr) => {
    setForm({
      contactName: addr.contactName || '',
      contactPhone: addr.contactPhone || '',
      line: addr.line || '',
      ward: addr.ward || '',
      district: addr.district || '',
      city: addr.city || '',
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault || false,
    });
    setModal({ mode: 'edit', id: addr.id });
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    saveMutation.mutate({ mode: modal.mode, id: modal.id, payload: form });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between border-b border-ink-100 pb-4">
        <h1 className="text-xl font-bold text-ink-900">Địa chỉ của tôi</h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
        >
          Thêm địa chỉ <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* List / empty state */}
      {addresses.length === 0 ? (
        <div className="py-16 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-ink-200" />
          <p className="text-ink-500">Bạn chưa có địa chỉ nào.</p>
          <Button variant="primary" className="mt-4" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Thêm địa chỉ đầu tiên
          </Button>
        </div>
      ) : (
        <div>
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              addr={addr}
              onEdit={openEdit}
              onDelete={setDeleting}
              onSetDefault={(a) => defaultMutation.mutate(a.id)}
            />
          ))}
        </div>
      )}

      {/* Add / edit modal */}
      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ'}
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Tên người nhận" value={form.contactName} onChange={setField('contactName')} required />
            <Input label="Số điện thoại" value={form.contactPhone} onChange={setField('contactPhone')} required />
          </div>
          <Input
            label="Địa chỉ (số nhà, đường)"
            value={form.line}
            onChange={setField('line')}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Phường/Xã" value={form.ward} onChange={setField('ward')} />
            <Input label="Quận/Huyện" value={form.district} onChange={setField('district')} />
            <Input label="Tỉnh/Thành phố" value={form.city} onChange={setField('city')} required />
          </div>
          <Input label="Mã bưu chính" value={form.postalCode} onChange={setField('postalCode')} />

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              className="h-4 w-4 rounded border-ink-200 text-brand-primary focus:ring-brand-primary"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setModal(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" loading={saveMutation.isPending}>
              Lưu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Xóa địa chỉ" size="sm">
        <p className="text-sm text-ink-500">Bạn có chắc muốn xóa địa chỉ này không?</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleting(null)}>
            Hủy
          </Button>
          <Button
            variant="danger"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate(deleting.id)}
          >
            Xóa
          </Button>
        </div>
      </Modal>
    </div>
  );
}
