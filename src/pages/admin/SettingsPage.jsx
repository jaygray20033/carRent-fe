// src/pages/admin/SettingsPage.jsx
// Admin site settings (Day 35 — UC-60).
//   - Loads all settings via GET /admin/settings ({ key: {value, grp, label} })
//   - Groups them into sections: Liên hệ | Pricing | Notifications | Storage | Khác
//   - PUT /admin/settings on save; server invalidates the Redis cache.
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Phone, DollarSign, Bell, HardDrive, Settings2 } from 'lucide-react';
import { adminSettingsService } from '../../services/adminService.js';
import Button from '../../components/ui/Button.jsx';
import Loading from '../../components/common/Loading.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

// Section order + presentation. Keys land in a section by their `grp`; anything
// unmapped falls into `general`.
const GROUPS = [
  { id: 'contact', label: 'Liên hệ', icon: Phone },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'storage', label: 'Storage', icon: HardDrive },
  { id: 'general', label: 'Khác', icon: Settings2 },
];

// Friendly labels for keys that may not carry one from the DB.
const KEY_LABEL = {
  hotline: 'Hotline',
  email: 'Email liên hệ',
  address: 'Địa chỉ',
  tax_rate: 'Thuế suất (%)',
  deposit_default: 'Đặt cọc mặc định (VND)',
  dropoff_penalty: 'Phụ phí trả khác điểm (VND)',
  hourly_rate_ratio: 'Hệ số giá theo giờ',
  with_driver_surcharge: 'Phụ phí tài xế',
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => adminSettingsService.getAll(),
  });

  const settings = useMemo(() => unwrap(data), [data]);

  // Edit overlay: only keys the user has changed. Displayed value falls back to
  // the loaded setting, so no effect is needed to seed the buffer.
  const [edits, setEdits] = useState({});
  const valueOf = (key) => edits[key] ?? settings[key]?.value ?? '';

  const mutation = useMutation({
    mutationFn: (payload) => adminSettingsService.update(payload),
    onSuccess: () => {
      toast.success('Đã lưu cài đặt');
      queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
    },
    onError: (e) => toast.error(e?.message || 'Lưu cài đặt thất bại'),
  });

  // Bucket keys into sections by grp.
  const sections = useMemo(() => {
    const buckets = Object.fromEntries(GROUPS.map((g) => [g.id, []]));
    for (const [key, meta] of Object.entries(settings)) {
      const grp = GROUPS.some((g) => g.id === meta?.grp) ? meta.grp : 'general';
      buckets[grp].push({ key, label: meta?.label || KEY_LABEL[key] || key });
    }
    for (const list of Object.values(buckets)) list.sort((a, b) => a.key.localeCompare(b.key));
    return buckets;
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Only send keys that actually changed.
    const changed = {};
    for (const [k, v] of Object.entries(edits)) {
      if (String(settings[k]?.value ?? '') !== String(v ?? '')) changed[k] = v;
    }
    if (Object.keys(changed).length === 0) {
      toast('Không có thay đổi nào');
      return;
    }
    mutation.mutate(changed);
  };

  if (isLoading) {
    return (
      <div className="p-12">
        <Loading />
      </div>
    );
  }

  const hasAny = Object.keys(settings).length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-ink-700">Cài đặt hệ thống</h1>
        <Button type="submit" variant="primary" size="md" loading={mutation.isPending}>
          Lưu thay đổi
        </Button>
      </div>

      {!hasAny ? (
        <div className="rounded-2xl bg-white p-8 text-center text-ink-400 shadow-sm ring-1 ring-ink-100">
          Chưa có cài đặt nào. Chạy seed để khởi tạo giá trị mặc định.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {GROUPS.map(({ id, label, icon: Icon }) => {
            const fields = sections[id];
            if (!fields || fields.length === 0) return null;
            return (
              <section
                key={id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-ink-100"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-semibold text-ink-700">{label}</h2>
                </div>
                <div className="space-y-3">
                  {fields.map(({ key, label: fieldLabel }) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-medium text-ink-400">
                        {fieldLabel}
                      </label>
                      <input
                        type="text"
                        value={valueOf(key)}
                        onChange={(e) =>
                          setEdits((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                        className="input w-full"
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </form>
  );
}
