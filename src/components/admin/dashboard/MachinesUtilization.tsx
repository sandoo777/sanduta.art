"use client";

import { useEffect, useState } from "react";
import { Server, Activity } from "lucide-react";
import { useAnalytics, MachineUtilization as AnalyticsMachine } from "@/modules/admin/useAnalytics";

interface MachineUtilization {
  id: string;
  name: string;
  type: string;
  utilization: number;
  activeTime: number;
  idleTime: number;
  status: "active" | "idle" | "maintenance";
}

export default function MachinesUtilization() {
  const { fetchMachinesUtilization, loading } = useAnalytics();
  const [machines, setMachines] = useState<MachineUtilization[]>([]);

  useEffect(() => {
    loadMachines();
    const interval = setInterval(loadMachines, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMachines = async () => {
    const data = await fetchMachinesUtilization();
    if (data) {
      // Add type field to each machine
      const transformed = data.map(item => ({
        ...item,
        type: "Laser", // Default type - can be improved with actual data
      }));
      setMachines(transformed);
    }
  };

  if (loading && machines.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "idle":
        return "bg-gray-400";
      case "maintenance":
        return "bg-orange-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activ";
      case "idle":
        return "Inactiv";
      case "maintenance":
        return "Mentenanță";
      default:
        return "Necunoscut";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Echipamente</h2>
          <p className="text-sm text-gray-600">Utilizare și status</p>
        </div>
      </div>

      {/* Machines List */}
      <div className="space-y-4">
        {machines.map((machine) => (
          <div key={machine.id} className="border border-gray-200 rounded-lg p-4">
            {/* Machine Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-900">{machine.name}</h3>
                  <p className="text-sm text-gray-600">{machine.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`${getStatusColor(
                    machine.status
                  )} w-2 h-2 rounded-full`}
                ></span>
                <span className="text-sm text-gray-600">
                  {getStatusLabel(machine.status)}
                </span>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Utilizare</span>
                <span className="text-sm font-semibold text-gray-900">
                  {machine.utilization}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    machine.utilization >= 80
                      ? "bg-green-500"
                      : machine.utilization >= 50
                      ? "bg-blue-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${machine.utilization}%` }}
                ></div>
              </div>
            </div>

            {/* Time Stats */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Activ: {machine.activeTime}h</span>
              <span>Inactiv: {machine.idleTime}h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {machines.filter((m) => m.status === "active").length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {machines.filter((m) => m.status === "idle").length}
            </p>
            <p className="text-sm text-gray-600">Idle</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(
                machines.reduce((acc, m) => acc + m.utilization, 0) / machines.length
              )}
              %
            </p>
            <p className="text-sm text-gray-600">Medie</p>
          </div>
        </div>
      </div>
    </div>
  );
}
