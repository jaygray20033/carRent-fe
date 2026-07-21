# OtoRent — Frontend (carRent-fe)

Ứng dụng thuê xe ô tô. React 19 + Vite + TailwindCSS v4 + React Router + TanStack Query.

## Cài đặt & chạy

```bash
npm install
npm run dev        # dev server tại http://localhost:3000 (proxy /api -> http://localhost:4000)
npm run build      # build production -> dist/
npm run preview    # chạy thử bản build
```

> Backend chạy ở `carRent-be` (xem `docker-compose.yml` ở thư mục gốc). FE proxy `/api` sang `localhost:4000`.

## Day 14 — Lịch đặt xe & Chi tiết đơn

### Trang đã hoàn thành

- **`pages/user/MyBookingsPage.jsx`** (Lịch đặt xe — Figma `UserAccount-Schedule.png`)
  - Tabs lọc trạng thái: **Tất cả / Chờ thanh toán / Đã xác nhận / Đang dùng / Hoàn tất / Đã hủy**
  - Danh sách đơn + **phân trang** (6 đơn/trang)
  - Click vào đơn (hoặc nút **Chi tiết**) → mở trang chi tiết
- **`pages/user/BookingDetailPage.jsx`** (mới)
  - **Timeline trạng thái** (Chờ thanh toán → Đã xác nhận → Đang dùng → Hoàn tất; hiển thị riêng cho Đã hủy/Hoàn tiền)
  - **Breakdown giá** (đơn giá/ngày, tạm tính, bảo hiểm, giảm giá, tổng cộng)
  - Nút **Thanh toán** (khi trạng thái `PENDING_PAYMENT`) và **Hủy đơn** (UC-20: chỉ khi `DRAFT/PENDING_PAYMENT/CONFIRMED`) với modal xác nhận
- **`components/layout/UserLayout.jsx`** (mới) — layout tài khoản người dùng: sidebar trái (Ví tiền, Lịch đặt xe, Địa chỉ của tôi, Lịch sử thanh toán, Đánh giá, Đăng xuất) + card hồ sơ. `MyBookingsPage`/`BookingDetailPage` render trong layout này.
- **`utils/bookingStatus.js`** (mới) — nhãn/màu trạng thái, danh sách tab, các bước timeline, helper `canCancel` / `needsPayment`.

### Routes (đều nằm dưới `UserLayout`, yêu cầu đăng nhập)

| Path                                                      | Trang                                         |
| --------------------------------------------------------- | --------------------------------------------- |
| `/me`                                                     | Hồ sơ (ProfilePage)                           |
| `/me/bookings`                                            | Lịch đặt xe (MyBookingsPage)                  |
| `/me/bookings/:id`                                        | Chi tiết đơn (BookingDetailPage)              |
| `/me/wallet` `/me/addresses` `/me/payments` `/me/reviews` | Placeholder (chưa triển khai — Tuần 6 trở đi) |

### API sử dụng

- `bookingService.listMy({ page, limit, status })` → `GET /bookings`
- `bookingService.detail(id)` → `GET /bookings/:id`
- `bookingService.cancel(id, reason)` → `PATCH /bookings/:id/cancel`
- `paymentService.checkout({ bookingId })` + `paymentService.mockConfirm(paymentId)` → luồng thanh toán mock

## Chưa triển khai (next steps)

- Trang Ví tiền / Địa chỉ / Lịch sử thanh toán / Đánh giá (sidebar đã có link, nội dung là placeholder).
- Cổng thanh toán thật (hiện dùng mock-confirm của backend).

## Ghi chú kỹ thuật khi build

- Entry chính là `src/main.jsx` (đã sửa `index.html` trỏ đúng; các file `*.tsx` cũ là prototype checkout không dùng).
- Dùng Tailwind v4 qua plugin `@tailwindcss/vite` (đã bỏ `postcss.config.js` cần `autoprefixer`).
- `package.json` đã bổ sung đủ dependency thực tế đang import (react-query, react-hook-form, react-hot-toast, lucide-react, clsx, @heroicons/react, dayjs, zustand, @headlessui/react, rc-slider, axios).

**Last Updated:** Day 14
