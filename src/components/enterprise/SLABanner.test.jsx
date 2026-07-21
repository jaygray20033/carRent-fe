// src/components/enterprise/SLABanner.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SLABanner from './SLABanner.jsx';

describe('SLABanner', () => {
  it('renders red banner when contractTerminationRisk=true', () => {
    render(<SLABanner contractTerminationRisk warningMessage="risk" />);
    expect(screen.getByTestId('sla-banner-critical')).toBeInTheDocument();
  });

  it('hides when no risk and no warning', () => {
    const { container } = render(<SLABanner contractTerminationRisk={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders warning banner when only warningMessage', () => {
    render(<SLABanner warningMessage="Cảnh báo: 1 vi phạm nghiêm trọng" />);
    expect(screen.getByTestId('sla-banner-warning')).toBeInTheDocument();
  });
});
