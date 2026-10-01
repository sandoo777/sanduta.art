import { machineFormSchema } from '../src/lib/validations/admin';

const sample = {
  name: 'xx',
  type: 'Digital Printer',
  equipmentType: 'DIGITAL_COLOR',
  status: 'AVAILABLE',
  compatibleMaterialIds: [],
  compatiblePrintMethodIds: [],
  active: true,
};

const result = machineFormSchema.safeParse(sample);
console.log(JSON.stringify(result, null, 2));
