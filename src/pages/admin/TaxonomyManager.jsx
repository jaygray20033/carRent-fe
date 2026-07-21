// src/pages/admin/TaxonomyManager.jsx
// Shared name/slug CRUD manager for post categories and tags (UC-56).
// Inline-editable list with an add form; slug auto-generated on the BE.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Loading from '../../components/common/Loading.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';

const unwrap = (res) => res?.data ?? res ?? {};

export default function TaxonomyManager({ title, service, queryKey, itemNoun }) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: () => service.list(),
  });
  const items = unwrap(data).items ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [queryKey] });

  const createMutation = useMutation({
    mutationFn: (name) => service.create({ name }),
    onSuccess: () => {
      toast.success(`Đã thêm ${itemNoun}`);
      setNewName('');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể thêm'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => service.update(id, { name }),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      setEditingId(null);
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => service.remove(id),
    onSuccess: () => {
      toast.success('Đã xóa');
      invalidate();
    },
    onError: (e) => toast.error(e?.message || 'Không thể xóa'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 1) return;
    createMutation.mutate(name);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const saveEdit = (id) => {
    const name = editName.trim();
    if (name.length < 1) return;
    updateMutation.mutate({ id, name });
  };

  const handleDelete = (item) => {
    if (window.confirm(`Xóa "${item.name}"? Thao tác này không thể hoàn tác.`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-5 text-xl font-bold text-ink-700">{title}</h1>

      {/* Add form */}
      <form
        onSubmit={handleCreate}
        className="mb-4 flex items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-100"
      >
        <div className="flex-1">
          <Input
            label={`Tên ${itemNoun} mới`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Nhập tên ${itemNoun}`}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          loading={createMutation.isPending}
          disabled={!newName.trim()}
        >
          Thêm
        </Button>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-100">
        {isLoading ? (
          <div className="p-8">
            <Loading />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <EmptyState title={`Chưa có ${itemNoun}`} description="Thêm mục đầu tiên ở trên." />
          </div>
        ) : (
          <ul>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 border-b border-ink-50 px-4 py-3 last:border-0"
                >
                  {isEditing ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(item.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        title="Lưu"
                        className="rounded-lg p-2 text-success transition-colors hover:bg-success/10"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        title="Hủy"
                        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-ink-700">{item.name}</p>
                        <p className="truncate text-xs text-ink-300">/{item.slug}</p>
                      </div>
                      <span className="shrink-0 text-xs text-ink-300">
                        {item.postCount ?? 0} bài
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        title="Sửa"
                        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-brand-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Xóa"
                        className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-danger/5 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
