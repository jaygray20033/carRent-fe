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
