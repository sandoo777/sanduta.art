'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Users, Circle, Award, Clock } from 'lucide-react';

type OperatorStatus = 'available' | 'busy' | 'offline';

interface Operator {
  id: string;
  name: string;
  email: string;
  status: OperatorStatus;
  currentJob?: {
    id: string;
    name: string;
    startedAt: string;
    estimatedEnd: string;
  };
  stats: {
    completedToday: number;
    completedWeek: number;
    avgCompletionTime: number; // minutes
  };
}

export default function OperatorsPanel() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperators();
    // Poll every 30 seconds
    const interval = setInterval(fetchOperators, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/operators');
      if (response.ok) {
        const data = await response.json();
        setOperators(data);
      }
    } catch (error) {
      console.error('Failed to fetch operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OperatorStatus) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'busy': return 'text-blue-600';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: OperatorStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponibili</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {operators.filter(o => o.status === 'available').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ocupați</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {operators.filter(o => o.status === 'busy').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Circle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Astăzi</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {operators.reduce((sum, o) => sum + o.stats.completedToday, 0)}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Operators List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {operators.map((operator) => (
          <Card key={operator.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {operator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(operator.status)} bg-current`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{operator.name}</h3>
                    <p className="text-sm text-gray-600">{operator.email}</p>
                  </div>
                </div>
                <Badge className={getStatusBadge(operator.status)}>
                  {operator.status}
                </Badge>
              </div>

              {/* Current Job */}
              {operator.currentJob && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium text-gray-900">
                    Job Curent:
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">{operator.currentJob.name}</p>
                    <div className="flex items-center gap-2 mt-2 text-gray-700">
                      <Clock className="w-4 h-4" />
                      <span>Timp rămas: {getTimeRemaining(operator.currentJob.estimatedEnd)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {operator.stats.completedToday}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Astăzi</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {operator.stats.completedWeek}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Săptămână</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(operator.stats.avgCompletionTime / 60)}h
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Timp mediu</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {operator.status === 'available' && (
                  <Button variant="primary" size="sm" className="flex-1">
                    Asignează Job
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="flex-1">
                  Vezi Detalii
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {operators.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nu există operatori disponibili</p>
        </Card>
      )}
    </div>
  );
}
