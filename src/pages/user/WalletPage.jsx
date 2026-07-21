// src/pages/user/WalletPage.jsx
// UC-44 (balance) + UC-45 (transactions) + UC-46 (topup).
// Figma: UserAccount-Wallet.png — a balance card, quick-amount presets + custom
// amount, a "Nạp tiền vào tài khoản" button, and a transaction-history tab.
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { walletService } from '../../services/walletService.js';
import Loading from '../../components/common/Loading.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000];
const MIN_TOPUP = 50_000;
const MAX_TOPUP = 50_000_000;

const METHOD_OPTIONS = [
  { value: 'VNPAY', label: 'VNPay' },
  { value: 'MOMO', label: 'MoMo' },
  { value: 'ZALOPAY', label: 'ZaloPay' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
];

const TYPE_LABELS = {
  TOPUP: 'Nạp tiền',
  PAYMENT: 'Thanh toán',
  REFUND: 'Hoàn tiền',
  WITHDRAW: 'Rút tiền',
};

const TYPE_FILTER_OPTIONS = [
  { value: '', label: 'Tất cả giao dịch' },
  { value: 'TOPUP', label: 'Nạp tiền' },
  { value: 'PAYMENT', label: 'Thanh toán' },
  { value: 'REFUND', label: 'Hoàn tiền' },
  { value: 'WITHDRAW', label: 'Rút tiền' },
];

const fmtVnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')} VND`;
const fmtDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (x) => String(x).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function BalanceCard({ balance, name }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-blue-700 p-6 text-white shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm/none opacity-80">Số dư ví</span>
        <WalletIcon className="h-6 w-6 opacity-80" />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight">{fmtVnd(balance)}</p>
      <p className="mt-6 text-sm uppercase tracking-widest opacity-90">{name}</p>
    </div>
  );
}

function TransactionTab() {
  const [type, setType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['wallet-transactions', type],
    queryFn: () => walletService.listTransactions(type ? { type } : {}),
  });

  const items = data?.data ?? [];

  // Client-side date-range filter (BE paginates; range narrows the current page).
  const filtered = items.filter((tx) => {
    const t = new Date(tx.createdAt).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime() + 86_400_000) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          label="Loại giao dịch"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={TYPE_FILTER_OPTIONS}
        />
        <Input label="Từ ngày" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="Đến ngày" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      {isLoading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-ink-400">Không có giao dịch nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-ink-400">
                <th className="py-2 pr-4 font-medium">Thời gian</th>
                <th className="py-2 pr-4 font-medium">Loại</th>
                <th className="py-2 pr-4 font-medium">Mô tả</th>
                <th className="py-2 pr-4 text-right font-medium">Số tiền</th>
                <th className="py-2 text-right font-medium">Số dư</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => {
                const credit = tx.amount >= 0;
                return (
                  <tr key={tx.id} className="border-b border-ink-50">
                    <td className="py-3 pr-4 text-ink-500">{fmtDateTime(tx.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-ink-700">
                        {credit ? (
                          <ArrowDownCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowUpCircle className="h-4 w-4 text-danger" />
                        )}
                        {TYPE_LABELS[tx.type] || tx.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-ink-500">{tx.description || '—'}</td>
                    <td
                      className={`py-3 pr-4 text-right font-semibold ${
                        credit ? 'text-green-600' : 'text-danger'
                      }`}
                    >
                      {credit ? '+' : ''}
                      {fmtVnd(tx.amount)}
                    </td>
                    <td className="py-3 text-right text-ink-500">{fmtVnd(tx.balanceAfter)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('topup'); // 'topup' | 'history'
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('VNPAY');

  const { data, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletService.getWallet(),
  });
  const wallet = data?.data?.wallet;

  const topupMutation = useMutation({
    mutationFn: (payload) => walletService.topup(payload),
    onSuccess: (res) => {
      const { checkoutUrl } = res?.data || {};
      if (checkoutUrl) {
        // Online provider → hand off to the gateway (VNPay/MoMo/ZaloPay).
        window.location.href = checkoutUrl;
        return;
      }
      // BANK_TRANSFER → pending, no redirect. Refresh so the user sees status.
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast.success('Đã tạo yêu cầu nạp tiền. Vui lòng chuyển khoản để hoàn tất.');
      setAmount('');
    },
    onError: (e) => toast.error(e?.message || 'Nạp tiền thất bại'),
  });

  if (isLoading) return <Loading />;

  const numericAmount = Number(String(amount).replace(/\D/g, ''));
  const amountValid = numericAmount >= MIN_TOPUP && numericAmount <= MAX_TOPUP;

  const submitTopup = (e) => {
    e.preventDefault();
    if (!amountValid) {
      toast.error(
        `Số tiền nạp phải từ ${fmtVnd(MIN_TOPUP)} đến ${fmtVnd(MAX_TOPUP)}`
      );
      return;
    }
    topupMutation.mutate({ amount: numericAmount, method });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink-100 md:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-ink-100 pb-4">
        <h1 className="text-xl font-bold text-ink-900">Ví tiền</h1>
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-ink-50 p-1">
          {[
            { key: 'topup', label: 'Nạp tiền' },
            { key: 'history', label: 'Lịch sử giao dịch' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === key ? 'bg-white text-brand-primary shadow-sm' : 'text-ink-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <BalanceCard balance={wallet?.balance} name={wallet ? 'OtoRent Wallet' : ''} />
      </div>

      {tab === 'topup' ? (
        <form onSubmit={submitTopup} className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">Chọn nhanh số tiền</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    numericAmount === amt
                      ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                      : 'border-ink-100 text-ink-600 hover:border-brand-primary/40'
                  }`}
                >
                  {amt.toLocaleString('vi-VN')}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Số tiền muốn nạp (VND)"
            inputMode="numeric"
            placeholder="Vui lòng nhập số tiền bạn muốn nạp vào ô trống"
            value={amount ? Number(numericAmount).toLocaleString('vi-VN') : ''}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
          />

          <Select
            label="Phương thức thanh toán"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={METHOD_OPTIONS}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={topupMutation.isPending}
            disabled={!amountValid}
          >
            Nạp tiền vào tài khoản
          </Button>
          <p className="text-center text-xs text-ink-400">
            Số tiền nạp tối thiểu {fmtVnd(MIN_TOPUP)}, tối đa {fmtVnd(MAX_TOPUP)}.
          </p>
        </form>
      ) : (
        <TransactionTab />
      )}
    </div>
  );
}
