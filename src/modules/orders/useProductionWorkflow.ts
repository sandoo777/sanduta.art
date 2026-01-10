import { useState } from 'react';

export interface WorkflowOperation {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProductionWorkflow {
  operator?: string;
  team?: string;
  equipment?: string;
  estimatedTimes: Record<string, number>; // operationId -> min
  realTimes: Record<string, number>; // operationId -> min
  checklist: WorkflowOperation[];
}

export function useProductionWorkflow(initial?: Partial<ProductionWorkflow>) {
  const [workflow, setWorkflow] = useState<ProductionWorkflow>({
    operator: initial?.operator,
    team: initial?.team,
    equipment: initial?.equipment,
    estimatedTimes: initial?.estimatedTimes || {},
    realTimes: initial?.realTimes || {},
    checklist: initial?.checklist || [
      { id: 'print', name: 'Print', completed: false },
      { id: 'cut', name: 'Tăiere', completed: false },
      { id: 'laminate', name: 'Laminare', completed: false },
      { id: 'pack', name: 'Ambalare', completed: false },
      { id: 'deliver', name: 'Livrare', completed: false },
    ],
  });

  const assignOperator = (operator: string) => setWorkflow(w => ({ ...w, operator }));
  const assignTeam = (team: string) => setWorkflow(w => ({ ...w, team }));
  const assignEquipment = (equipment: string) => setWorkflow(w => ({ ...w, equipment }));
  const setEstimatedTime = (operationId: string, min: number) => setWorkflow(w => ({ ...w, estimatedTimes: { ...w.estimatedTimes, [operationId]: min } }));
  const setRealTime = (operationId: string, min: number) => setWorkflow(w => ({ ...w, realTimes: { ...w.realTimes, [operationId]: min } }));
  const completeOperation = (operationId: string) => setWorkflow(w => ({
    ...w,
    checklist: w.checklist.map(op => op.id === operationId ? { ...op, completed: true, completedAt: new Date().toISOString() } : op),
  }));

  return {
    workflow,
    assignOperator,
    assignTeam,
    assignEquipment,
    setEstimatedTime,
    setRealTime,
    completeOperation,
  };
}
