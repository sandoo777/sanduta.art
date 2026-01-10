'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Clock, Play, Pause, CheckCircle, RefreshCw, Filter } from 'lucide-react';
import { ProductionJob, ProductionStatus, ProductionPriority } from '@/modules/production/useProduction';

interface WorkQueueFilters {
  status?: ProductionStatus;
  priority?: ProductionPriority;
  operatorId?: string;
}

export default function WorkQueue() {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<WorkQueueFilters>({});

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.operatorId) params.append('operatorId', filters.operatorId);

      const response = await fetch(`/api/production?${params}`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/production/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS', startedAt: new Date().toISOString() }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to start job:', error);
    }
  };

  const handlePauseJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/production/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ON_HOLD' }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to pause job:', error);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/production/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED', 
          completedAt: new Date().toISOString() 
        }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Failed to complete job:', error);
    }
  };

  const getPriorityColor = (priority: ProductionPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'ON_HOLD': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filtre:</span>
          </div>
          
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as ProductionStatus || undefined })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Toate Statusurile</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value as ProductionPriority || undefined })}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Toate Prioritățile</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Nu există operațiuni în coadă</p>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{job.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Comandă: <span className="font-mono">#{job.orderId.slice(0, 8)}</span>
                        {job.order?.customerName && (
                          <span className="ml-2">• {job.order.customerName}</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Operator:</span>
                      <p className="font-medium">
                        {job.assignedTo?.name || 'Neasignat'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Started:</span>
                      <p className="font-medium">
                        {job.startedAt 
                          ? new Date(job.startedAt).toLocaleDateString('ro-RO')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <p className="font-medium">
                        {job.dueDate 
                          ? new Date(job.dueDate).toLocaleDateString('ro-RO')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Timp estimat:</span>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        2h 30m
                      </p>
                    </div>
                  </div>

                  {job.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <strong>Note:</strong> {job.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 min-w-[180px]">
                  {job.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartJob(job.id)}
                      className="flex-1 lg:w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  )}
                  
                  {job.status === 'IN_PROGRESS' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePauseJob(job.id)}
                        className="flex-1 lg:w-full"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleCompleteJob(job.id)}
                        className="flex-1 lg:w-full"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    </>
                  )}
                  
                  {job.status === 'ON_HOLD' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleStartJob(job.id)}
                      className="flex-1 lg:w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = `/admin/production/${job.id}`}
                    className="flex-1 lg:w-full"
                  >
                    Vezi Detalii
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
