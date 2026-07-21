// LoginModal component tests (Day 42) — login step validation + submit path.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the auth service so no real HTTP happens.
const login = vi.fn();
vi.mock('../../services/authService.js', () => ({
  authService: {
    login: (...a) => login(...a),
    register: vi.fn(),
    verifyOtp: vi.fn(),
    resendOtp: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

// Mock the Zustand store selector.
const setAuth = vi.fn();
vi.mock('../../store/authStore.js', () => ({
  useAuthStore: (sel) => sel({ setAuth }),
}));

// Silence toast.
vi.mock('react-hot-toast', () => ({
  default: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}));

import LoginModal from './LoginModal.jsx';

describe('LoginModal', () => {
  beforeEach(() => {
    login.mockReset();
    setAuth.mockReset();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<LoginModal open={false} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the login heading when open', () => {
    render(<LoginModal open onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument();
  });

  it('rejects an invalid identifier and stays on the phone step', async () => {
    const user = userEvent.setup();
    render(<LoginModal open onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/0901234567/), 'not-valid');
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    expect(screen.getByText(/không hợp lệ/)).toBeInTheDocument();
    // Still on the phone step (no password field yet).
    expect(screen.queryByLabelText('Mật khẩu')).not.toBeInTheDocument();
  });

  it('advances to the password step for a valid phone, then logs in', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({
      data: { user: { id: 1 }, accessToken: 'a', refreshToken: 'r' },
    });
    const onClose = vi.fn();
    render(<LoginModal open onClose={onClose} />);

    await user.type(screen.getByPlaceholderText(/0901234567/), '0901234567');
    await user.click(screen.getByRole('button', { name: 'Tiếp tục' }));

    // Password step.
    const pwd = await screen.findByPlaceholderText('••••••••');
    await user.type(pwd, 'Password123');
    await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(login).toHaveBeenCalledWith({ identifier: '0901234567', password: 'Password123' });
    // finishAuth wires the store + closes the modal.
    expect(setAuth).toHaveBeenCalledWith({ id: 1 }, 'a', 'r');
    expect(onClose).toHaveBeenCalledWith({ loggedIn: true });
  });
});
