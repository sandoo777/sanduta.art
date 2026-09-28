import React from 'react';
import { render } from '@testing-library/react';

const modMachine = await import('./src/app/admin/machines/_components/MachineForm.tsx');
const modForm = await import('./src/components/ui/Form.tsx');
const modInput = await import('./src/components/ui/Input.tsx');
const modButton = await import('./src/components/ui/Button.tsx');
const modCompat = await import('./src/app/admin/finishing/_components/MaterialCompatibilitySelector.tsx');

console.log('MachineForm keys', Object.keys(modMachine));
console.log('MachineForm type', typeof modMachine.MachineForm);
console.log('Form type', typeof modForm.Form);
console.log('Input type', typeof modInput.Input);
console.log('Button type', typeof modButton.Button);
console.log('Compat type', typeof modCompat.MaterialCompatibilitySelector);

const { MachineForm } = modMachine;
try {
  render(React.createElement(MachineForm, {
    machine: {
      id: 'm1',
      name: 'X',
      type: 'Digital Color',
      equipmentType: 'DIGITAL_COLOR',
      productionMode: 'IN_HOUSE',
      status: 'AVAILABLE',
      active: true,
      description: '',
      notes: '',
      compatibleMaterialIds: [],
      consumables: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    onSubmit: async () => {},
    onClose: () => {},
  }));
  console.log('render ok');
} catch (error) {
  console.error('render failed');
  console.error(error);
}
