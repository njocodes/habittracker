// Calendar View Component - Komplett neu implementiert

'use client';

import { useState } from 'react';
import { CalendarViewProps } from '@/types/habits';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

export function CalendarView({ habits, isHabitCompletedOnDate, onToggleHabit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getHabitColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-black rounded-lg shadow-lg border border-gray-800 p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
        >
          ←
        </button>
        
        <h2 className="text-lg font-semibold text-white">
          {format(currentDate, 'MMMM yyyy', { locale: de })}
        </h2>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayString = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={dayString}
              className={`
                min-h-[60px] p-1 border border-gray-100
                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
              `}
            >
              <div className="flex flex-col h-full">
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${isCurrentDay ? 'text-blue-600' : ''}
                `}>
                  {format(day, 'd')}
                </div>
                
                <div className="flex-1 flex flex-col space-y-1">
                  {habits.map((habit) => {
                    const isCompleted = isHabitCompletedOnDate(habit.id, dayString);
                    
                    return (
                      <button
                        key={habit.id}
                        onClick={() => onToggleHabit(habit.id, dayString)}
                        className={`
                          w-full h-4 rounded text-xs flex items-center justify-center
                          transition-all hover:scale-105
                          ${isCompleted 
                            ? `${getHabitColor(habit.color)} text-white` 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }
                        `}
                        title={`${habit.name} - ${isCompleted ? 'Erledigt' : 'Nicht erledigt'}`}
                      >
                        {isCompleted ? habit.icon : '○'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Legende:</h3>
        <div className="flex flex-wrap gap-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center space-x-1 text-xs">
              <div className={`w-3 h-3 rounded ${getHabitColor(habit.color)}`} />
              <span className="text-gray-600">{habit.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}