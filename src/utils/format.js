// src/utils/format.js
import dayjs from 'dayjs';

export const formatCurrency = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export const formatDate = (d, fmt = 'DD/MM/YYYY') => (d ? dayjs(d).format(fmt) : '-');
export const formatDateTime = (d) => (d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '-');

export const diffDays = (start, end) => {
  const d = dayjs(end).diff(dayjs(start), 'day');
  return Math.max(1, d);
};
