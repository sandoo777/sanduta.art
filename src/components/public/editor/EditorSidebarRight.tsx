'use client';

import { useState } from 'react';
import PropertiesPanel from './properties/PropertiesPanel';
import { LayersPanel } from './layers/LayersPanel';

type TabType = 'layers' | 'properties';

export default function EditorSidebarRight() {
  const [activeTab, setActiveTab] = useState<TabType>('layers');

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('layers')}
          className={`
            flex-1 py-3 text-sm font-medium transition-colors
            ${activeTab === 'layers'
              ? 'text-[#0066FF] border-b-2 border-[#0066FF]'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Layers
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`
            flex-1 py-3 text-sm font-medium transition-colors
            ${activeTab === 'properties'
              ? 'text-[#0066FF] border-b-2 border-[#0066FF]'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Properties
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Layers Panel */}
        {activeTab === 'layers' && (
          <LayersPanel />
        )}

        {/* Properties Panel */}
        {activeTab === 'properties' && (
          <PropertiesPanel />
        )}
      </div>
    </div>
  );
}
