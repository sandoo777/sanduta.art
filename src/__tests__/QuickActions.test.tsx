import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuickActions } from '@/app/admin/dashboard/_components/QuickActions';

describe('QuickActions', () => {
  it('renders inventory, purchase orders, partner and supplier shortcuts', () => {
    render(<QuickActions />);

    expect(screen.getByRole('link', { name: /Inventar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Comenzi Achiziții/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Parteneri/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Furnizori/i })).toBeInTheDocument();
  });
});
