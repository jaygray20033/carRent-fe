// Public shareable-link join page (corporate). Anyone with the link lands here.
// Unauthenticated visitors preview the company, then get routed to register/login
// with this URL preserved so they come straight back and join after signup.
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Building2, CheckCircle2, AlertCircle, UserCircle2, LogIn, UserPlus } from 'lucide-react';
import { enterpriseService } from '../../services/enterpriseService.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Loading from '../../components/common/Loading.jsx';

const REASON_MESSAGE = {
  NOT_FOUND: 'Link mời không tồn tại.',
  REVOKED: 'Link mời đã bị thu hồi.',
  EXPIRED: 'Link mời đã hết hạn.',
  EXHAUSTED: 'Link mời đã đạt số lượt tham gia tối đa.',
  CORPORATE_INACTIVE: 'Doanh nghiệp đang tạm ngưng.',
};

export default function EnterpriseJoinLinkPage() {
  const { token = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // 'loading' → previewing link; 'preview' → valid, show CTA; 'done'; 'error'.
  const [phase, setPhase] = useState('loading');
  const [company, setCompany] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    let alive = true;
    if (!token) {
      // Schedule state update to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        if (alive) {
          setPhase('error');
          setMessage('Link mời không có mã.');
        }
      });
      return;
    }
    (async () => {
      try {
        const res = await enterpriseService.previewInviteLink(token);
        const data = res?.data ?? res ?? {};
        if (!alive) return;
        if (!data.valid) {
          setPhase('error');
          setMessage(REASON_MESSAGE[data.reason] || 'Link mời không hợp lệ.');
          return;
        }
        setCompany(data.company || null);
        setPhase('preview');
      } catch (err) {
        if (!alive) return;
        setPhase('error');
        setMessage(err?.message || 'Không thể kiểm tra link mời.');
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  const join = async () => {
    setSubmitting(true);
    try {
      await enterpriseService.joinViaLink(token);
      setPhase('done');
      setMessage(`Bạn đã tham gia ${company?.name || 'doanh nghiệp'} thành công.`);
    } catch (err) {
      setPhase('error');
      setMessage(err?.message || 'Không thể tham gia doanh nghiệp.');
    } finally {
      setSubmitting(false);
    }
  };

  const goRegister = () => navigate('/register', { state: { from: returnTo } });
  const goLogin = () => navigate('/login', { state: { from: returnTo } });
  const switchAccount = async () => {
    await logout();
    navigate('/login', { state: { from: returnTo }, replace: true });
  };

  if (phase === 'loading') return <Loading label="Đang kiểm tra link mời..." />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-ink-100">
        <Building2 className="mx-auto h-10 w-10 text-brand-primary" />

        {phase === 'preview' && (
          <>
            <h1 className="mt-4 text-xl font-bold text-ink-700">
              Tham gia {company?.name || 'doanh nghiệp'}
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Bạn được mời tham gia doanh nghiệp trên hệ thống CarGoGo.
            </p>

            {isAuthenticated ? (
              <>
                <div className="mt-5 flex items-center gap-3 rounded-xl bg-ink-50 p-4 text-left">
                  <UserCircle2 className="h-9 w-9 shrink-0 text-ink-400" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink-700">
                      {user?.fullName || 'Tài khoản của bạn'}
                    </div>
                    <div className="truncate text-xs text-ink-400">
                      {user?.email || user?.phone || ''}
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <Button className="w-full" loading={submitting} onClick={join}>
                    Xác nhận tham gia
                  </Button>
                  <button
                    type="button"
                    onClick={switchAccount}
                    className="w-full text-sm font-medium text-ink-500 hover:text-ink-700"
                  >
                    Không phải bạn? Đổi tài khoản
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-6 space-y-3">
                <Button
                  className="w-full"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                  onClick={goRegister}
                >
                  Đăng ký để tham gia
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  leftIcon={<LogIn className="h-4 w-4" />}
                  onClick={goLogin}
                >
                  Đã có tài khoản? Đăng nhập
                </Button>
              </div>
            )}
          </>
        )}

        {phase === 'done' && (
          <>
            <CheckCircle2 className="mx-auto mt-5 h-12 w-12 text-emerald-600" />
            <h1 className="mt-3 text-xl font-bold text-ink-700">Tham gia thành công</h1>
            <p className="mt-2 text-sm text-ink-500">{message}</p>
            <div className="mt-6">
              <Button className="w-full" onClick={() => navigate('/enterprise/dashboard')}>
                Vào cổng doanh nghiệp
              </Button>
            </div>
          </>
        )}

        {phase === 'error' && (
          <>
            <AlertCircle className="mx-auto mt-5 h-12 w-12 text-red-600" />
            <h1 className="mt-3 text-xl font-bold text-ink-700">Không thể tham gia</h1>
            <p className="mt-2 text-sm text-ink-500">{message}</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full text-sm font-medium text-ink-400 hover:text-ink-600"
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
