import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSidebar } from '@/app/admin/_components/AdminSidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/purchase-orders',
}));

describe('AdminSidebar persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists expanded state to localStorage and auto-expands the active section', () => {
    render(<AdminSidebar isOpen />);

    const depozitButton = screen.getByRole('button', { name: /Depozit/i });
    expect(depozitButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(depozitButton);
    expect(JSON.parse(window.localStorage.getItem('adminSidebarState') ?? '{}')).toMatchObject({ depozit: false });

    fireEvent.click(depozitButton);
    expect(JSON.parse(window.localStorage.getItem('adminSidebarState') ?? '{}')).toMatchObject({ depozit: true });
  });
});
