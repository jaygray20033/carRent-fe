import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-primary-600">404</h1>
      <p className="mt-2 text-lg text-gray-700">Trang không tồn tại</p>
      <Link to="/" className="btn-primary mt-6">
        Về trang chủ
      </Link>
    </div>
  );
}
