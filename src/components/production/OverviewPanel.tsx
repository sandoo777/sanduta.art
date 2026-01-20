'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Cog, 
  Users,
  TrendingUp,
  Package
} from 'lucide-react';

interface OverviewStats {
  activeJobs: number;
  completedToday: number;
  delayed: number;
  machinesActive: number;
  machinesTotal: number;
  operatorsActive: number;
  operatorsTotal: number;
  avgCompletionTime: number; // minutes
}

export default function OverviewPanel() {
  const [stats, setStats] = useState<OverviewStats>({
    activeJobs: 0,
    completedToday: 0,
    delayed: 0,
    machinesActive: 0,
    machinesTotal: 0,
    operatorsActive: 0,
    operatorsTotal: 0,
    avgCompletionTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/production/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (_error) {
      console.error('Failed to fetch production stats:', error);
    } finally {
      setLoading(false);
    }
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
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Jobs */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comenzi în Producție</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.activeJobs}</p>
              <p className="text-xs text-gray-500 mt-1">Active acum</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        {/* Completed Today */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Finalizate Astăzi</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedToday}</p>
              <p className="text-xs text-gray-500 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +15% vs ieri
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Delayed */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Operațiuni Întârziate</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.delayed}</p>
              <p className="text-xs text-gray-500 mt-1">Necesită atenție</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Avg Completion Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Timp Mediu</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {Math.round(stats.avgCompletionTime / 60)}h
              </p>
              <p className="text-xs text-gray-500 mt-1">Per comandă</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machines Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Cog className="w-5 h-5 text-gray-600" />
              Echipamente
            </h3>
            <span className="text-sm text-gray-600">
              {stats.machinesActive}/{stats.machinesTotal} active
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Utilizare:</span>
              <span className="text-sm font-medium">
                {stats.machinesTotal > 0 
                  ? Math.round((stats.machinesActive / stats.machinesTotal) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.machinesTotal > 0 
                    ? (stats.machinesActive / stats.machinesTotal) * 100 
                    : 0}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">{stats.machinesActive}</div>
                <div className="text-xs text-gray-600">Running</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-600">
                  {stats.machinesTotal - stats.machinesActive}
                </div>
                <div className="text-xs text-gray-600">Idle</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="text-lg font-bold text-yellow-600">0</div>
                <div className="text-xs text-gray-600">Maintenance</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Operators Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Operatori
            </h3>
            <span className="text-sm text-gray-600">
              {stats.operatorsActive}/{stats.operatorsTotal} activi
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ocupare:</span>
              <span className="text-sm font-medium">
                {stats.operatorsTotal > 0 
                  ? Math.round((stats.operatorsActive / stats.operatorsTotal) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${stats.operatorsTotal > 0 
                    ? (stats.operatorsActive / stats.operatorsTotal) * 100 
                    : 0}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="text-lg font-bold text-blue-600">{stats.operatorsActive}</div>
                <div className="text-xs text-gray-600">Busy</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  {stats.operatorsTotal - stats.operatorsActive}
                </div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-600">0</div>
                <div className="text-xs text-gray-600">Offline</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Production Throughput Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-gray-600" />
          Producție Zilnică (Ultima Săptămână)
        </h3>
        <div className="h-64 flex items-end justify-between gap-2">
          {[12, 15, 10, 18, 14, 16, 13].map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-indigo-100 rounded-t transition-all duration-300 hover:bg-indigo-200"
                   style={{ height: `${(value / 20) * 100}%`, minHeight: '20px' }}>
                <div className="text-xs text-center pt-2 font-medium text-indigo-700">
                  {value}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'][index]}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acțiuni Rapide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center">
            <Activity className="w-6 h-6 mx-auto text-gray-600 mb-2" />
            <span className="text-sm font-medium">Start New Job</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center">
            <CheckCircle className="w-6 h-6 mx-auto text-gray-600 mb-2" />
            <span className="text-sm font-medium">Complete Jobs</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors text-center">
            <Cog className="w-6 h-6 mx-auto text-gray-600 mb-2" />
            <span className="text-sm font-medium">Manage Machines</span>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center">
            <Users className="w-6 h-6 mx-auto text-gray-600 mb-2" />
            <span className="text-sm font-medium">Assign Operators</span>
          </button>
        </div>
      </Card>
    </div>
  );
}
