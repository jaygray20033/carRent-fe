import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cuộn về đầu trang mỗi khi đổi pathname (react-router giữ nguyên vị trí cuộn theo mặc định).
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
