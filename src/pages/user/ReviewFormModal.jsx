// src/pages/user/ReviewFormModal.jsx
// UC-50 — write a review for a COMPLETED booking. Rendered from ReviewsPage.
// POST /bookings/:id/review { rating, content?, photos?[] }.
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X, Plus } from 'lucide-react';
import { reviewService } from '../../services/reviewService.js';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import Rating from '../../components/ui/Rating.jsx';

const RATING_HINTS = {
  1: 'Rất tệ',
  2: 'Không hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
};

export default function ReviewFormModal({ booking, onClose }) {
  const open = Boolean(booking);
  const car = booking?.vehicle || {};
  const qc = useQueryClient();

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoInput, setPhotoInput] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      reviewService.create(booking.id, {
        rating,
        content: content.trim() || undefined,
        photos: photos.length ? photos : undefined,
      }),
    onSuccess: () => {
      toast.success('Cảm ơn bạn đã đánh giá!');
      qc.invalidateQueries({ queryKey: ['my-reviews'] });
      qc.invalidateQueries({ queryKey: ['reviewable-bookings'] });
      onClose();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    },
  });

  const addPhoto = () => {
    const url = photoInput.trim();
    if (!url) return;
    if (photos.length >= 10) {
      toast.error('Tối đa 10 ảnh.');
      return;
    }
    setPhotos((prev) => [...prev, url]);
    setPhotoInput('');
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  return (
    <Modal open={open} onClose={onClose} title="Viết đánh giá" size="lg">
      {booking && (
        <div className="space-y-5">
          {/* Car summary */}
          <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-3">
            {car.thumbnailUrl ? (
              <img
                src={car.thumbnailUrl}
                alt={car.name}
                className="h-14 w-20 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="h-14 w-20 shrink-0 rounded-lg bg-ink-100" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{car.name || 'Xe đã thuê'}</p>
              <p className="text-xs text-ink-400">Đơn {booking.bookingCode}</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">Mức độ hài lòng</p>
            <div className="flex items-center gap-3">
              <Rating value={rating} size="lg" interactive onChange={setRating} />
              <span className="text-sm text-ink-500">{RATING_HINTS[rating]}</span>
            </div>
          </div>

          {/* Content */}
          <Textarea
            label="Nhận xét của bạn"
            rows={4}
            maxLength={2000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về chiếc xe này..."
          />

          {/* Photos (optional, by URL) */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-ink-700">Ảnh (tuỳ chọn)</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPhoto();
                  }
                }}
                placeholder="Dán link ảnh (https://...)"
                className="input flex-1"
              />
              <Button variant="outline" onClick={addPhoto} leftIcon={<Plus className="h-4 w-4" />}>
                Thêm
              </Button>
            </div>
            {photos.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {photos.map((url, idx) => (
                  <div key={`${url}-${idx}`} className="relative">
                    <img
                      src={url}
                      alt={`Ảnh ${idx + 1}`}
                      className="h-16 w-16 rounded-lg object-cover ring-1 ring-ink-100"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-ink-900/80 p-0.5 text-white hover:bg-ink-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
              Huỷ
            </Button>
            <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
              Gửi đánh giá
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
