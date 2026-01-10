'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
  id: string;
  jobName: string;
  orderId: string;
  startTime: Date;
  endTime: Date;
  operator: string;
  machine: string;
  status: 'scheduled' | 'in-progress' | 'completed';
}

export default function ProductionCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Generate week days
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

  // Mock events - în producție ar veni din API
  const events: CalendarEvent[] = [
    {
      id: '1',
      jobName: 'Print Banner 3x2m',
      orderId: 'ORD-001',
      startTime: new Date(2026, 0, 13, 9, 0),
      endTime: new Date(2026, 0, 13, 11, 0),
      operator: 'Ion Popescu',
      machine: 'Printer UV #1',
      status: 'in-progress',
    },
    {
      id: '2',
      jobName: 'Cut Vinyl Stickers',
      orderId: 'ORD-002',
      startTime: new Date(2026, 0, 13, 14, 0),
      endTime: new Date(2026, 0, 13, 16, 0),
      operator: 'Maria Ionescu',
      machine: 'Plotter #2',
      status: 'scheduled',
    },
  ];

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = event.startTime;
      return (
        eventDate.toDateString() === day.toDateString() &&
        eventDate.getHours() === hour
      );
    });
  };

  const getEventColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'scheduled': return 'bg-green-500 text-white';
      case 'completed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-lg font-semibold text-gray-900">
              {weekDays[0].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })} -{' '}
              {weekDays[6].toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Astăzi
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
            <div className="p-4 text-sm font-medium text-gray-600 border-r border-gray-200">
              Ora
            </div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-4 text-center border-r border-gray-200 ${
                  isToday(day) ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="text-sm font-medium text-gray-900">
                  {day.toLocaleDateString('ro-RO', { weekday: 'short' })}
                </div>
                <div
                  className={`text-lg font-semibold mt-1 ${
                    isToday(day) ? 'text-indigo-600' : 'text-gray-700'
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-4 text-sm text-gray-600 border-r border-gray-200 bg-gray-50">
                {hour}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDayAndHour(day, hour);
                return (
                  <div
                    key={dayIndex}
                    className={`p-2 border-r border-gray-200 min-h-[80px] ${
                      isToday(day) ? 'bg-indigo-50/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`${getEventColor(event.status)} rounded p-2 mb-2 text-xs cursor-pointer hover:opacity-90 transition-opacity`}
                      >
                        <div className="font-medium truncate">{event.jobName}</div>
                        <div className="opacity-90 truncate">{event.machine}</div>
                        <div className="opacity-90 truncate">{event.operator}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-gray-700">Legendă:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">În progres</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Programat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded"></div>
            <span className="text-sm text-gray-600">Finalizat</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
