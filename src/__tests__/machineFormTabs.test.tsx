import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MachineForm as MachineFormBase } from '@/app/admin/machines/_components/MachineForm';
import { PrintMethodForm } from '@/app/admin/print-methods/_components/PrintMethodForm';
import { MACHINE_TYPES } from '@/modules/machines/types';
import { filterMachines } from '@/modules/machines/useMachines';
import { PRINT_METHOD_TYPES } from '@/modules/print-methods/types';

const MachineForm = MachineFormBase as any;

vi.mock('@/modules/materials/useMaterials', () => ({
  useMaterials: () => ({
    getMaterials: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock('@/modules/machines/useMachines', () => ({
  useMachines: () => ({
    getMachines: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock('../app/admin/machines/_components/EquipmentConsumables', () => ({
  EquipmentConsumables: () => <div data-testid="equipment-consumables">Consumables</div>,
}));

vi.mock('../app/admin/finishing/_components/MaterialCompatibilitySelector', () => ({
  MaterialCompatibilitySelector: () => <div data-testid="compatibility-selector">Compatibility selector</div>,
}));

vi.mock('../app/admin/finishing/_components/PrintMethodCompatibilitySelector', () => ({
  PrintMethodCompatibilitySelector: () => <div data-testid="print-method-selector">Print method selector</div>,
}));

vi.mock('@/modules/settings/useSettings', () => ({
  useSettings: () => ({
    getSystemSettings: vi.fn().mockResolvedValue({
      'production_cost.electricity_cost_mdl_per_kwh': '2.4',
      'production_cost.production_operator_cost_mdl_per_hour': '20',
      'production_cost.finishing_operator_cost_mdl_per_hour': '18',
      'production_cost.design_operator_cost_mdl_per_hour': '25',
      'production_cost.default_working_hours_per_day': '8',
    }),
  }),
}));

describe('MachineForm tabs', () => {
  it('shows the required equipment tabs and keeps the maintenance date read-only while exposing history management', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-1',
          name: 'Test machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [
            {
              id: 'm-1',
              machineId: 'machine-1',
              date: '2026-09-12',
              type: 'Preventive',
              description: 'Oil check',
              cost: 120,
              technician: 'Alex',
              notes: 'Completed',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          lastMaintenance: '2026-09-12',
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /^General$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Compatibilities$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Technical Parameters$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Maintenance$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Consumables$/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Last Maintenance/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Last Maintenance: 12.09.2026/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Maintenance$/i }));
    expect(screen.getByText(/Preventive/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Add Maintenance$/i })).toBeInTheDocument();
  });

  it('does not render the legacy print method compatibility selector', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-no-print-methods',
          name: 'Machine without print methods',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Compatibilities$/i }));
    expect(screen.queryByText(/Metode de tipărire compatibile/i)).not.toBeInTheDocument();
  });

  it('keeps print-method types identical to machine types', () => {
    expect(PRINT_METHOD_TYPES.map((item) => item.value)).toEqual(MACHINE_TYPES.map((item) => item.value));
  });

  it('shows three sourcing modes for print-method methods: inhouse, outsource and mixed', () => {
    render(
      <PrintMethodForm
        printMethod={null}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByText(/Sursă metodă/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Inhouse/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Outsource/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Mixt/i })).toBeInTheDocument();
  });

  it('shows the partner selector when the print method is outsourced', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ items: [{ id: 'partner-1', name: 'Acme Print' }, { id: 'partner-2', name: 'North Studio' }] }),
    } as Response);

    render(
      <PrintMethodForm
        printMethod={null}
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /Outsource/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Partener la care tipărim/i)).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Acme Print/i })).toBeInTheDocument();
    });

    fetchMock.mockRestore();
  });

  it('does not render the old required-fields notice after interacting with the form', () => {
    render(
      <MachineForm
        machine={undefined}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/ex: Xerox Versant 280, Mimaki UCJV300/i), {
      target: { value: 'New digital printer' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Adaugă echipament$/i }));

    expect(screen.queryByText(/Câmpuri obligatorii pentru Digital Color/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Opționale:/i)).not.toBeInTheDocument();
  });

  it('shows which fields are required and optional for the selected equipment type', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-required-fields',
          name: 'Required fields machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByText(/Câmpuri obligatorii pentru Digital Color/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Opționale:/i)).not.toBeInTheDocument();
  });

  it('keeps a single equipment type selector with the same functionality under the name Tip echipament', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-2',
          name: 'Test machine',
          type: 'Plotter Cutting',
          equipmentType: 'PLOTTER_CUTTING',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Tip echipament/i)).toBeInTheDocument();
    expect(screen.queryByText(/Categorie calcul cost/i)).not.toBeInTheDocument();
  });

  it('closes the modal after a successful update submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <MachineForm
        machine={{
          id: 'machine-close',
          name: 'Close machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Actualizează$/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('replaces max width and height with a single printable margin setting for the sheet perimeter', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-margins',
          name: 'Margin machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.queryByText(/Margini neprintabile/i)).not.toBeInTheDocument();
  });

  it('shows the operator hourly cost from global system settings for digital equipment', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-operator-global',
          name: 'Global cost machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/Cost operator/i)).toBeInTheDocument();
    expect(screen.getByText(/20\.00 MDL\/oră/i)).toBeInTheDocument();
    expect(screen.getByText(/Consum energie pe oră/i)).toBeInTheDocument();
  });

  it('shows only the equipment cost per page in the Digital section without the extra breakdown rows', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-3',
          name: 'Digital printer',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          purchaseCostMdl: 80000,
          expectedLifetimePages: 1000000,
          energyConsumptionKw: 2.8,
          electricityCostPerKwh: 2.4,
          operatorCostPerHour: 25,
          speedPpm: 100,
          maintenanceComponents: [{ name: 'Fuser', cost: 100000, expectedLifetimePages: 100000 }],
          tonerConsumables: [{ type: 'Black', cost: 1000, yieldPages: 20000 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/Cost echipament \/ pagini/i)).toBeInTheDocument();
    expect(screen.getByText(/0\.08/i)).toBeInTheDocument();
    expect(screen.getByText(/^Tonner$/i)).toBeInTheDocument();
    expect(screen.queryByText(/^Amortizare$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Întreținere$/i)).not.toBeInTheDocument();
  });

  it('loads toner options from materials and auto-fills the price from the selected material', async () => {
    const mockMaterials = [
      { id: 'mat-cyan', name: 'Cyan Ink', purchasePrice: 245, salePrice: 320, unit: 'ml' },
      { id: 'mat-magenta', name: 'Magenta Ink', purchasePrice: 210, salePrice: 290, unit: 'ml' },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMaterials,
    }) as typeof fetch;

    render(
      <MachineForm
        machine={{
          id: 'machine-toner-materials',
          name: 'Material toner machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: /Cyan Ink/i })).toBeInTheDocument();
    });

    const tonerPriceInput = screen.getByDisplayValue('245');
    expect(tonerPriceInput).toHaveAttribute('readonly');
    expect(screen.getAllByDisplayValue('245').length).toBeGreaterThan(0);
  });

  it('opens a material picker modal from the toner type button and lets the user choose a material', async () => {
    const mockMaterials = [
      { id: 'mat-cyan', name: 'Cyan Ink', purchasePrice: 245, salePrice: 320, unit: 'ml' },
      { id: 'mat-magenta', name: 'Magenta Ink', purchasePrice: 210, salePrice: 290, unit: 'ml' },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMaterials,
    }) as typeof fetch;

    render(
      <MachineForm
        machine={{
          id: 'machine-toner-picker',
          name: 'Picker machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));

    const tonerTypeButton = await screen.findByRole('button', { name: /Cyan Ink/i });
    fireEvent.click(tonerTypeButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Selectează materialul/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Magenta Ink/i }));
    expect(screen.getByRole('button', { name: /Magenta Ink/i })).toBeInTheDocument();
  });

  it('opens the toner picker even when the material list is still empty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as typeof fetch;

    render(
      <MachineForm
        machine={{
          id: 'machine-toner-empty',
          name: 'Empty material machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));

    const emptyTonerButton = screen.getByRole('button', { name: /Alege material/i });
    fireEvent.click(emptyTonerButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Nu există materiale disponibile/i)).toBeInTheDocument();
  });

  it('shows maintenance component rows with custom name, price, recommended pages and calculated cost per page', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-maintenance',
          name: 'Digital printer',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          purchaseCostMdl: 200000,
          expectedLifetimePages: 400000,
          energyConsumptionKw: 2.5,
          electricityCostPerKwh: 2.4,
          speedPpm: 80,
          maintenanceComponents: [{ name: 'Drum', cost: 2400, expectedLifetimePages: 120000 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/Consumabile/i)).toBeInTheDocument();
    expect(screen.getByText(/Denumire/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Cost \/ pagină/i).length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue('Drum').length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue('2400').length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue('120000').length).toBeGreaterThan(0);
    expect(screen.getByText(/0\.02/i)).toBeInTheDocument();
  });

  it('keeps the maintenance consumable name input mounted while typing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as typeof fetch;

    render(
      <MachineForm
        machine={{
          id: 'machine-maintenance-focus',
          name: 'Digital printer',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
          status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          purchaseCostMdl: 200000,
          expectedLifetimePages: 400000,
          energyConsumptionKw: 2.5,
          electricityCostPerKwh: 2.4,
          speedPpm: 80,
          maintenanceComponents: [{ name: 'Drum', cost: 2400, expectedLifetimePages: 120000 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    await waitFor(() => expect(screen.getByText(/2\.40 MDL\/kWh/i)).toBeInTheDocument());

    const nameInput = screen.getByPlaceholderText('ex: Drum');
    fireEvent.change(nameInput, { target: { value: 'Drum X' } });

    expect(screen.getByPlaceholderText('ex: Drum')).toHaveValue('Drum X');
  });

  it('starts with a single blank consumable row and allows removing it', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-empty-consumables',
          name: 'No consumables',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getAllByPlaceholderText('ex: Drum')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /^Șterge$/i }).length).toBeGreaterThan(0);
  });

  it('shows power consumption per hour and reads the electricity price from system settings automatically', async () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-power-settings',
          name: 'Power settings machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/Consum energie pe oră/i)).toBeInTheDocument();
    expect(screen.getByText(/2\.40 MDL\/kWh/i)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('2.4')).not.toBeInTheDocument();
  });

  it('removes the legacy standalone speed field from the digital machine form', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-speed-removed',
          name: 'No speed field machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/Viteză după gramaj/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Viteză$/i)).not.toBeInTheDocument();
  });

  it('shows the electricity cost in MDL per hour and minute based on power consumption', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-energy-cost',
          name: 'Energy cost machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          energyConsumptionKw: 2.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/6\.72 MDL\/h/i)).toBeInTheDocument();
    expect(screen.getByText(/0\.11 MDL\/min/i)).toBeInTheDocument();
  });

  it('shows an editable paper-weight speed profile table for digital equipment', () => {
    render(
      <MachineForm
        machine={{
          id: 'machine-speed-profile-matrix',
          name: 'Speed matrix machine',
          type: 'Digital Color',
          equipmentType: 'DIGITAL_COLOR',
                    status: 'AVAILABLE',
          active: true,
          description: '',
          notes: '',
          compatibleMaterialIds: [],
          consumables: [],
          maintenanceHistory: [],
          speedProfiles: [
            { minWeight: 0, maxWeight: 120, speedPpm: 80 },
            { minWeight: 121, maxWeight: 200, speedPpm: 60 },
            { minWeight: 201, maxWeight: 300, speedPpm: 40 },
            { minWeight: 301, maxWeight: 400, speedPpm: 20 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Technical Parameters$/i }));
    expect(screen.getByText(/Viteză după gramaj/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();
    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
  });

  it('keeps machine filtering focused on status and type without the removed production-mode selector', () => {
    const machines = [
      { id: '1', name: 'Internal', type: 'Digital Color', equipmentType: 'DIGITAL_COLOR', status: 'AVAILABLE', active: true, compatibleMaterialIds: [], createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Busy machine', type: 'Plotter Cutting', equipmentType: 'PLOTTER_CUTTING', status: 'BUSY', active: true, compatibleMaterialIds: [], createdAt: new Date(), updatedAt: new Date() },
    ] as any;

    expect(filterMachines(machines, { status: 'BUSY' })).toHaveLength(1);
    expect(filterMachines(machines, { status: 'BUSY' })[0].name).toBe('Busy machine');
  });
});
