# 🚗 CarRent Frontend

Frontend cho hệ thống thuê xe ô tô — phiên bản init.

## 🧱 Tech Stack

- **Framework**: React 18 + Vite 5
- **Styling**: TailwindCSS 3
- **Routing**: React Router 6
- **State**: Zustand (auth) + TanStack Query (server state)
- **Forms**: React Hook Form
- **HTTP**: Axios
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

## 📁 Folder Structure

```
carRent-fe/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/         # MainLayout, Header, Footer
│   │   ├── common/         # Button, Input, Loading, ...
│   │   ├── car/            # CarCard, CarFilter
│   │   ├── booking/        # BookingForm, BookingItem
│   │   └── auth/           # ProtectedRoute
│   ├── pages/
│   │   ├── auth/           # Login, Register
│   │   ├── car/            # CarList, CarDetail
│   │   ├── booking/        # BookingCheckout, BookingSuccess
│   │   ├── user/           # Profile, MyBookings
│   │   ├── HomePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/              # custom hooks (useAuth, ...)
│   ├── services/           # API client + endpoint modules
│   ├── store/              # zustand stores
│   ├── utils/              # formatters, helpers, constants
│   ├── styles/             # global css + tailwind
│   ├── App.jsx             # Root routes
│   └── main.jsx            # Entry
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env
# → chỉnh VITE_API_URL nếu backend chạy khác port

# 3. Dev
npm run dev
```

App chạy tại: `http://localhost:5173`
Backend default: `http://localhost:4000/api/v1`

## 🧭 Routes (đã code)

| Path               | Page             | Auth |
| ------------------ | ---------------- | ---- |
| `/`                | Home             | ❌   |
| `/cars`            | Car list         | ❌   |
| `/cars/:id`        | Car detail       | ❌   |
| `/login`           | Login            | ❌   |
| `/register`        | Register         | ❌   |
| `/checkout/:carId` | Booking checkout | ✅   |
| `/me`              | Profile          | ✅   |
| `/me/bookings`     | My bookings      | ✅   |

## 🔐 Demo accounts

- Admin: `0900000001` / `Admin@1234`
- User : `0901234567` / `User@1234`

## 🧪 Day 5 — Lint, Format, Husky & CI

- **ESLint v9** flat config (`eslint.config.js`) + **Prettier** (`.prettierrc.json`) + `.editorconfig`.
- Scripts: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`, `npm run build`.
- **Husky + lint-staged**: `.husky/pre-commit` chạy `npx lint-staged` (ESLint `--fix` + Prettier `--write` trên file thay đổi). Hook cài qua script `prepare` khi `npm install`.
- **GitHub Actions CI** (`.github/workflows/ci.yml`, job `lint-test-fe`): Node 20 → `npm ci` → `npm run lint` → `npm run format:check` → `npm run build`. Trigger: PR + push `master`/`main`.
- **Branch protection**: trên GitHub → Settings → Branches → require PR + require status check `Lint & Build (Frontend)` cho nhánh chính.

## 🛣️ Roadmap (chưa code)

- Admin dashboard
- Wallet UI
- Reviews & ratings
- Blog list & detail
- Multi-language (i18n)
- Skeleton loaders, image optimization
- Unit tests (Vitest + Testing Library)
