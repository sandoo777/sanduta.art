'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Cog, Play, Square, Wrench, Activity } from 'lucide-react';

type MachineStatus = 'idle' | 'running' | 'maintenance' | 'offline';

interface Machine {
  id: string;
  name: string;
  type: string;
  status: MachineStatus;
  currentJob?: {
    id: string;
    name: string;
    startedAt: string;
    estimatedEnd: string;
  };
  operator?: {
    id: string;
    name: string;
  };
  speed?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export default function MachinesPanel() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchMachines, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await fetch('/api/machines');
      if (response.ok) {
        const data = await response.json();
        setMachines(data);
      }
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: MachineStatus) => {
    switch (status) {
      case 'running': return <Activity className="w-5 h-5 text-green-600 animate-pulse" />;
      case 'idle': return <Square className="w-5 h-5 text-gray-600" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-yellow-600" />;
      case 'offline': return <Square className="w-5 h-5 text-red-600" />;
      default: return <Cog className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeRemaining = (estimatedEnd: string) => {
    const now = new Date();
    const end = new Date(estimatedEnd);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {machines.filter(m => m.status === 'running').length}
          </div>
          <div className="text-sm text-gray-600">Running</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-600">
            {machines.filter(m => m.status === 'idle').length}
          </div>
          <div className="text-sm text-gray-600">Idle</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {machines.filter(m => m.status === 'maintenance').length}
          </div>
          <div className="text-sm text-gray-600">Maintenance</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {machines.filter(m => m.status === 'offline').length}
          </div>
          <div className="text-sm text-gray-600">Offline</div>
        </Card>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <Card key={machine.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(machine.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                    <p className="text-sm text-gray-600">{machine.type}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(machine.status)}>
                  {machine.status}
                </Badge>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {machine.speed && (
                  <div>
                    <span className="text-gray-600">Speed:</span>
                    <p className="font-medium">{machine.speed}</p>
                  </div>
                )}
                {machine.maxWidth && machine.maxHeight && (
                  <div>
                    <span className="text-gray-600">Max Size:</span>
                    <p className="font-medium">{machine.maxWidth} × {machine.maxHeight} mm</p>
                  </div>
                )}
              </div>

              {/* Current Job */}
              {machine.currentJob && (
                <div className="border-t pt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    Job Curent:
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{machine.currentJob.name}</p>
                    <p className="text-gray-600">
                      Timp rămas: {getTimeRemaining(machine.currentJob.estimatedEnd)}
                    </p>
                  </div>
                  {machine.operator && (
                    <p className="text-sm text-gray-600">
                      Operator: {machine.operator.name}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {machine.status === 'idle' && (
                  <Button variant="primary" size="sm" className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Job
                  </Button>
                )}
                {machine.status === 'running' && (
                  <Button variant="danger" size="sm" className="flex-1">
                    <Square className="w-4 h-4 mr-2" />
                    Stop Job
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="flex-1">
                  <Wrench className="w-4 h-4 mr-2" />
                  Maintenance
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {machines.length === 0 && (
        <Card className="p-12 text-center">
          <Cog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nu există echipamente configurate</p>
          <Button variant="primary" className="mt-4">
            Adaugă Echipament
          </Button>
        </Card>
      )}
    </div>
  );
}
