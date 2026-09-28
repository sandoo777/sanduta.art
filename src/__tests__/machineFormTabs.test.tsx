import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MachineForm } from '@/app/admin/machines/_components/MachineForm';

vi.mock('../app/admin/machines/_components/EquipmentConsumables', () => ({
  EquipmentConsumables: () => <div data-testid="equipment-consumables">Consumables</div>,
}));

vi.mock('../app/admin/finishing/_components/MaterialCompatibilitySelector', () => ({
  MaterialCompatibilitySelector: () => <div data-testid="compatibility-selector">Compatibility selector</div>,
}));

describe('MachineForm tabs', () => {
  it('shows the required equipment tabs and moves the technical and consumables sections into their own tabs', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-1',
          name: 'Test machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
          productionMode: 'IN_HOUSE',
          status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /General/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compatibilities/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Costs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Technical Parameters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consumables/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Technical Parameters/i }));
    expect(screen.getByText(/Parametri Digital/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Consumables/i }));
    expect(screen.getByTestId('equipment-consumables')).toBeInTheDocument();
  });
});
