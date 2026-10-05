import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminSidebar } from '@/app/admin/_components/AdminSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/inventory',
}));

describe('AdminSidebar', () => {
  it('renders the Depozit section and keeps the supplier and partner registries visible', () => {
    render(<AdminSidebar isOpen />);

    expect(screen.getByRole('button', { name: /Depozit/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: /Inventar/i })).toHaveAttribute('href', '/admin/inventory');
    expect(screen.getByRole('menuitem', { name: /Comenzi Achiziții/i })).toHaveAttribute('href', '/admin/purchase-orders');
    expect(screen.getByRole('menuitem', { name: /Parteneri/i })).toHaveAttribute('href', '/admin/partners');
    expect(screen.getByRole('menuitem', { name: /Furnizori/i })).toHaveAttribute('href', '/admin/suppliers');
  });

  it('toggles a section when clicked and collapses the catalog menu', () => {
    render(<AdminSidebar isOpen />);

    const catalogButton = screen.getByRole('button', { name: /Catalog/i });
    expect(catalogButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(catalogButton);
    expect(screen.getByRole('menuitem', { name: /Produse/i })).toBeInTheDocument();

    fireEvent.click(catalogButton);
    expect(screen.queryByRole('menuitem', { name: /Produse/i })).not.toBeInTheDocument();
  });
});
