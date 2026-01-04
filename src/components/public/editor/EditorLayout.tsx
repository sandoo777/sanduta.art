'use client';

import { ReactNode } from 'react';

interface EditorLayoutProps {
  topbar: ReactNode;
  leftSidebar: ReactNode;
  canvas: ReactNode;
  rightSidebar: ReactNode;
}

export default function EditorLayout({
  topbar,
  leftSidebar,
  canvas,
  rightSidebar,
}: EditorLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#F3F4F6] overflow-hidden">
      {/* Topbar */}
      <div className="h-16 bg-white border-b border-[#E5E7EB] flex-shrink-0 shadow-sm z-20">
        {topbar}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Toolbox */}
        <div className="w-20 bg-white border-r border-[#E5E7EB] flex-shrink-0 shadow-sm z-10 
                        hidden md:block">
          {leftSidebar}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto relative">
          {canvas}
        </div>

        {/* Right Sidebar - Layers & Properties */}
        <div className="w-80 bg-white border-l border-[#E5E7EB] flex-shrink-0 shadow-sm z-10 
                        hidden lg:block">
          {rightSidebar}
        </div>
      </div>

      {/* Mobile Panels Overlay */}
      <div className="md:hidden fixed inset-0 pointer-events-none z-30">
        {/* Mobile toolbox will slide in from left */}
        {/* Mobile layers/properties will slide in from right */}
      </div>
    </div>
  );
}
