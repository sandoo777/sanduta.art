'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui';
import OverviewPanel from '@/components/production/OverviewPanel';
import WorkQueue from '@/components/production/WorkQueue';
import MachinesPanel from '@/components/production/MachinesPanel';
import OperatorsPanel from '@/components/production/OperatorsPanel';
import ProductionCalendar from '@/components/production/ProductionCalendar';
import { Activity, ListChecks, Cog, Users, Calendar } from 'lucide-react';

export default function ProductionDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-indigo-600" />
                Production Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Monitorizează și gestionează producția în timp real
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">12</div>
                <div className="text-xs text-gray-600">Active Jobs</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-xs text-gray-600">Completed Today</div>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-xs text-gray-600">Delayed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid bg-white p-1 rounded-lg border border-gray-200">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Work Queue</span>
            </TabsTrigger>
            <TabsTrigger value="machines" className="flex items-center gap-2">
              <Cog className="w-4 h-4" />
              <span className="hidden sm:inline">Machines</span>
            </TabsTrigger>
            <TabsTrigger value="operators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Operators</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewPanel />
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <WorkQueue />
          </TabsContent>

          <TabsContent value="machines" className="mt-6">
            <MachinesPanel />
          </TabsContent>

          <TabsContent value="operators" className="mt-6">
            <OperatorsPanel />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <ProductionCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
