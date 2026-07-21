// CarCard component tests (Day 42).
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CarCard from './CarCard.jsx';

const renderCard = (car, props = {}) =>
  render(
    <MemoryRouter>
      <CarCard car={car} {...props} />
    </MemoryRouter>
  );

const baseCar = {
  id: 7,
  name: 'Toyota Vios 2023',
  modelYear: 2023,
  fuelType: 'GASOLINE',
  transmission: 'AUTO',
  pricePerDay: 800000,
  rating: 4.5,
  reviewCount: 12,
};

describe('CarCard', () => {
  it('renders the car name and links to its detail page', () => {
    renderCard(baseCar);
    expect(screen.getByText('Toyota Vios 2023')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/cars/7');
  });

  it('shows the daily price formatted with a thousands separator', () => {
    renderCard(baseCar);
    // vi-VN currency formatting groups with a dot: 800.000
    expect(screen.getByText(/800\.000/)).toBeInTheDocument();
  });

  it('maps fuel and transmission codes to Vietnamese labels', () => {
    renderCard({ ...baseCar, fuelType: 'ELECTRIC', transmission: 'MANUAL' });
    expect(screen.getByText('Điện')).toBeInTheDocument();
    expect(screen.getByText('Số sàn')).toBeInTheDocument();
  });

  it('renders the rating badge only when rating > 0', () => {
    const { rerender } = renderCard(baseCar);
    expect(screen.getByText('4.5')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CarCard car={{ ...baseCar, rating: 0 }} />
      </MemoryRouter>
    );
    expect(screen.queryByText('4.5')).not.toBeInTheDocument();
  });

  it('falls back to a placeholder image when no thumbnail is provided', () => {
    renderCard(baseCar);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain('placehold.co');
  });

  it('renders a skeleton (no car content) while loading', () => {
    renderCard(baseCar, { loading: true });
    expect(screen.queryByText('Toyota Vios 2023')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
