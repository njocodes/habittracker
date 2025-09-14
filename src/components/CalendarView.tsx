'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Habit } from '@/types/habits';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';

interface CalendarViewProps {
  habits: Habit[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
  onToggleHabit: (habitId: string, date: string) => void;
}

export function CalendarView({ habits, isHabitCompletedOnDate, onToggleHabit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getCompletionStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completedHabits = habits.filter(habit => 
      isHabitCompletedOnDate(habit.id, dateStr)
    );
    return {
      total: habits.length,
      completed: completedHabits.length,
      percentage: habits.length > 0 ? (completedHabits.length / habits.length) * 100 : 0
    };
  };

  const getDayColor = (completion: { percentage: number }) => {
    if (completion.percentage === 100) return 'bg-green-500';
    if (completion.percentage >= 75) return 'bg-green-400';
    if (completion.percentage >= 50) return 'bg-yellow-400';
    if (completion.percentage >= 25) return 'bg-orange-400';
    if (completion.percentage > 0) return 'bg-red-400';
    return 'bg-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            Heute
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month start */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-${index}`} className="h-12" />
        ))}

        {/* Days of the month */}
        {days.map(day => {
          const completion = getCompletionStatus(day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toISOString()}
              className={`
                h-12 relative cursor-pointer rounded-lg transition-all duration-200
                ${isCurrentMonth ? 'hover:bg-gray-50' : ''}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => {
                if (isCurrentMonth) {
                  habits.forEach(habit => {
                    if (!isHabitCompletedOnDate(habit.id, format(day, 'yyyy-MM-dd'))) {
                      onToggleHabit(habit.id, format(day, 'yyyy-MM-dd'));
                    }
                  });
                }
              }}
            >
              <div className="flex items-center justify-center h-full">
                <span className={`text-sm font-medium ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              {/* Completion indicator */}
              {isCurrentMonth && completion.total > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`w-2 h-2 rounded-full ${getDayColor(completion)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Fertigstellung:</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>100%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <span>75%+</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-full" />
              <span>50%+</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-400 rounded-full" />
              <span>25%+</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <span>1%+</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded-full" />
              <span>0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
