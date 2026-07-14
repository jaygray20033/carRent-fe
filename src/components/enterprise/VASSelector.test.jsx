// src/components/enterprise/VASSelector.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VASSelector from './VASSelector.jsx';
import { computeVasTotal } from './vasTotal.js';

const items = [
  {
    vasId: 1,
    code: 'INTERPRETER',
    name: 'Phiên dịch viên',
    unit: 'người/chuyến',
    unitPrice: 500000,
    requiresHeadcount: true,
    isActive: true,
  },
  {
    vasId: 2,
    code: 'SECURITY',
    name: 'Bảo vệ',
    unit: 'người/chuyến',
    unitPrice: 800000,
    requiresHeadcount: true,
    isActive: true,
  },
  {
    vasId: 3,
    code: 'OFF',
    name: 'Ngưng',
    unit: 'buổi',
    unitPrice: 100000,
    isActive: false,
  },
];

describe('VASSelector', () => {
  it('does not render inactive VAS', () => {
    render(<VASSelector items={items} value={{}} onChange={() => {}} />);
    expect(screen.getByText('Phiên dịch viên')).toBeInTheDocument();
    expect(screen.queryByText('Ngưng')).not.toBeInTheDocument();
  });

  it('toggle enables card + shows headcount input', () => {
    const onChange = vi.fn();
    render(<VASSelector items={items} value={{}} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('vas-toggle-1'));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0][0];
    expect(next[1].enabled).toBe(true);
  });

  it('live total updates with headcount', () => {
    const value = {
      1: { enabled: true, headcount: 2 },
      2: { enabled: true, headcount: 1 },
    };
    render(<VASSelector items={items} value={value} onChange={() => {}} />);
    // 500k*2 + 800k*1 = 1.800.000
    expect(screen.getByTestId('vas-total').textContent).toMatch(/1\.800\.000/);
    expect(computeVasTotal(items, value)).toBe(1_800_000);
  });
});
